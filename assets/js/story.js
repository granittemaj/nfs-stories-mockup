/* Not For Sale stories: the scroll engine. No dependencies.

   A story is a run of sections. Each section has a sticky stage (the picture) and a column of
   steps (the text) that scroll over it. Steps drive everything through data attributes:

     data-g="x:50;y:40;s:1;r:0;rx:0;o:1;screen:lock;msgs:0;a:#id"   the guide (.st-guide)
     data-gm="..."      phone values for narrow screens, on top of data-g
     data-cam="x y s"   move the scene's .cam group to centre x,y (SVG units) at scale s
     data-camm="x y s"  the same for narrow screens
     data-ring="n"      switch on the scene's .st-ring[data-on=n]
     data-stop="id"     the map: the bus reaches this stop when the step is centred
     data-ledger="n"    the kitchen ledger: show rows up to n
     data-t="0.5"       a .st-track diagram: the travelling dot reaches this point (0 to 1)
     data-year="2015"   a .st-year counter in the stage counts to this year (or shows the text)
     data-units="n"     a .st-units chart (canvas, one square per person) shows layer n

   Section attributes: data-progress sets --p (0 to 1) on the section as it scrolls past;
   data-cam0 / data-cam0m give the camera before the first card (default: the whole scene).
   Elements with data-seen="n" get .seen once a step with data-ring >= n has been reached.

   Guide values a step leaves out are carried over from the step before. Positions are in % of
   the stage, or follow an element with a:#id. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  root.classList.add('st-js');
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = d.querySelector('.st-guide'), screens = !!(phone && phone.querySelector('.scr'));
  var main = d.getElementById('st');
  if (!main) return;

  var vw = 0, vh = 0, stTop = 0, narrow = false, pw = 0, ph = 0, docTop = 0, mainTop = 0, mainH = 0;
  var sections = [], chain = [], chainM = [], rail = [], keepUntil = 0, ticking = false;

  var clamp = function (v, a, b) { return v < (a || 0) ? (a || 0) : v > (b === undefined ? 1 : b) ? (b === undefined ? 1 : b) : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  function parse(s) {
    var o = {};
    (s || '').split(';').forEach(function (p) {
      var i = p.indexOf(':');
      if (i < 1) return;
      var k = p.slice(0, i).trim(), v = p.slice(i + 1).trim();
      o[k] = (k === 'screen' || k === 'a') ? v : parseFloat(v);
    });
    return o;
  }
  function cam(s) { var p = (s || '').split(/\s+/).map(parseFloat); return p.length === 3 ? p : null; }

  /* ---------------------------------------------------------------- build */
  [].forEach.call(main.querySelectorAll('.st-sc'), function (el) {
    var S = { el: el, stage: el.querySelector('.st-stage'), steps: [], active: -1 };
    S.cam = S.stage && S.stage.querySelector('.cam');
    if (S.cam) {
      var vb = (S.cam.ownerSVGElement.getAttribute('viewBox') || '0 0 1600 1000').split(/\s+/).map(parseFloat);
      S.camC = [vb[0] + vb[2] / 2, vb[1] + vb[3] / 2];
    }
    S.rings = [].slice.call(el.querySelectorAll('.st-ring'));
    S.marks = [].slice.call(el.querySelectorAll('[data-seen]'));
    S.spots = S.stage ? [].slice.call(S.stage.querySelectorAll('.st-spot')) : [];
    S.ledger = S.stage && S.stage.querySelector('.st-ledger');
    S.progress = el.hasAttribute('data-progress');
    [].forEach.call(el.querySelectorAll('.st-step'), function (st) { S.steps.push({ el: st, c: 0 }); });
    var map = S.stage && S.stage.querySelector('.st-map');
    if (map) S.map = mapInit(map, S);
    var track = el.querySelector('.st-track');
    if (track) S.track = trackInit(track);
    S.year = S.stage && S.stage.querySelector('.st-year');
    var units = S.stage && S.stage.querySelector('.st-units');
    if (units) S.units = unitsInit(units);
    sections.push(S);
  });

  // Guide keyframes: two chains (wide and narrow), each filling gaps from the step before.
  (function () {
    var last = { x: 50, y: 50, s: 1, r: 0, rx: 0, o: 1, screen: 'lock', msgs: 0, a: '' }, lastM = null;
    [].forEach.call(main.querySelectorAll('[data-g]'), function (el) {
      var g = parse(el.getAttribute('data-g')), gm = parse(el.getAttribute('data-gm'));
      // a step that gives a position lets go of any element the phone was following
      if (('x' in g || 'y' in g) && !('a' in g)) g.a = '';
      if (('x' in gm || 'y' in gm) && !('a' in gm)) gm.a = '';
      var v = Object.assign({}, last, g);
      var vm = Object.assign({}, lastM || last, g, gm);
      chain.push({ el: el, v: v, at: 0 });
      chainM.push({ el: el, v: vm, at: 0 });
      last = v; lastM = vm;
    });
  })();

  // Chapter rail
  (function () {
    var nav = d.querySelector('.st-rail ol');
    if (!nav) return;
    sections.forEach(function (S) {
      var name = S.el.getAttribute('data-chapter');
      if (!name) return;
      var li = d.createElement('li'), b = d.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span></span><i aria-hidden="true"></i>';
      b.firstChild.textContent = name;
      b.addEventListener('click', function () { w.scrollTo({ top: S.top + 2, behavior: reduce ? 'auto' : 'smooth' }); });
      li.appendChild(b); nav.appendChild(li);
      rail.push({ S: S, b: b });
    });
  })();

  // The numbered signs point at their steps: clicking one scrolls its card into view.
  sections.forEach(function (S) {
    S.spots.forEach(function (sp) {
      sp.addEventListener('click', function () {
        var st = S.steps[+sp.getAttribute('data-n')];
        if (st) w.scrollTo({ top: st.c - centre(), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  });

  /* ---------------------------------------------------------------- the map */
  function mapInit(svg, S) {
    var route = svg.querySelector('#st-route'), glow = svg.querySelector('.m-route-glow');
    var bus = svg.querySelector('.m-bus');
    var L = route.getTotalLength();
    var stops = {}, list = [];
    [].forEach.call(svg.querySelectorAll('.m-stop'), function (g) {
      var m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(g.getAttribute('transform'));
      var x = +m[1], y = +m[2], best = 0, bd = 1e9;
      for (var i = 0; i <= 800; i++) {
        var p = route.getPointAtLength(L * i / 800), dd = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (dd < bd) { bd = dd; best = i / 800; }
      }
      var o = { g: g, x: x, y: y, f: best, id: g.getAttribute('data-stop') };
      stops[o.id] = o; list.push(o);
    });
    [route, glow].forEach(function (p) { p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var trip = S.stage.querySelector('.st-trip'), km = +svg.getAttribute('data-km') || 0;
    var kmOut = S.stage.querySelector('.st-trip-km'), kmTotal = S.el.querySelector('.st-km-total');
    if (kmTotal && km) kmTotal.textContent = 'About ' + fmt(km) + ' km';
    return { svg: svg, route: route, glow: glow, bus: bus, L: L, stops: stops, list: list, trip: trip, km: km, kmOut: kmOut, t: -1, vb: '' };
  }

  function mapFrame(S, y) {
    var M = S.map, ks = [];
    S.steps.forEach(function (st) {
      var id = st.el.getAttribute('data-stop');
      if (id && M.stops[id]) ks.push({ at: st.c - centre(), f: M.stops[id].f });
    });
    var t = 0;
    if (ks.length) {
      if (y <= ks[0].at) t = ks[0].f;
      else if (y >= ks[ks.length - 1].at) t = ks[ks.length - 1].f;
      else for (var i = 0; i < ks.length - 1; i++) {
        if (y >= ks[i].at && y < ks[i + 1].at) {
          var u = (y - ks[i].at) / (ks[i + 1].at - ks[i].at);
          if (reduce) u = u < .5 ? 0 : 1;
          t = lerp(ks[i].f, ks[i + 1].f, u);
        }
      }
    }
    var r = S.stage.getBoundingClientRect(), sw = r.width || vw, sh = r.height || vh;
    var aspect = sw / sh, VW = aspect < .9 ? 540 : aspect < 1.3 ? 960 : 1400;
    var VH = VW / aspect, p = M.route.getPointAtLength(M.L * t), cx, cy;
    // wide screens: the route sits left of the docked phone; narrow screens follow the bus
    if (VW >= 1200) { cx = lerp(1010, p.x, .18); cy = lerp(600, p.y, .3); } else { cx = p.x; cy = p.y; }
    cx = VW >= 1600 ? 800 : clamp(cx, VW / 2, 1600 - VW / 2);
    cy = VH >= 1100 ? 550 : clamp(cy, VH / 2, 1100 - VH / 2);
    var vb = (cx - VW / 2).toFixed(1) + ' ' + (cy - VH / 2).toFixed(1) + ' ' + VW + ' ' + VH.toFixed(1);
    var k = VW / sw;
    if (vb !== M.vb) { M.svg.setAttribute('viewBox', vb); M.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); M.vb = vb; }
    if (t !== M.t || k !== M.k) {
      M.route.style.strokeDashoffset = M.L * (1 - t);
      M.glow.style.strokeDashoffset = M.L * (1 - t);
      M.route.style.strokeWidth = (3.5 * k).toFixed(2);
      M.glow.style.strokeWidth = (10 * k).toFixed(2);
      var p2 = M.route.getPointAtLength(Math.min(M.L, M.L * t + 2)), a = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
      if (a > 90 || a < -90) a += 180; // keep the bus upright
      M.bus.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + a.toFixed(1) + ') scale(' + k.toFixed(3) + ')');
      var here = null;
      M.list.forEach(function (s) {
        var on = s.f <= t + .003;
        s.g.classList.toggle('on', on);
        if (on) here = s;
        s.g.setAttribute('transform', 'translate(' + s.x + ' ' + s.y + ') scale(' + k.toFixed(3) + ')');
      });
      M.list.forEach(function (s) { s.g.classList.toggle('is-here', s === here && t > 0 && t < 1.001); });
      if (M.trip) M.trip.style.setProperty('--t', t.toFixed(4));
      if (M.kmOut) M.kmOut.textContent = fmt(Math.round(t * M.km / 10) * 10) + ' km';
      M.t = t; M.k = k;
    }
  }

  /* ---------------------------------------------------------------- tracks (a dot on a path) */
  // <svg class="st-track"> holds path.st-track-path, an element .st-track-dot and nodes [data-t].
  function trackInit(svg) {
    var path = svg.querySelector('.st-track-path'), L = path.getTotalLength();
    path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
    return { svg: svg, path: path, L: L, dot: svg.querySelector('.st-track-dot'), nodes: [].slice.call(svg.querySelectorAll('[data-t]')), t: -1 };
  }
  function trackFrame(S, y) {
    var T = S.track, ks = [];
    S.steps.forEach(function (st) { var v = st.el.getAttribute('data-t'); if (v !== null) ks.push({ at: st.c - centre(), f: +v }); });
    var t = 0;
    if (ks.length) {
      if (y <= ks[0].at) t = ks[0].f;
      else if (y >= ks[ks.length - 1].at) t = ks[ks.length - 1].f;
      else for (var i = 0; i < ks.length - 1; i++) {
        if (y >= ks[i].at && y < ks[i + 1].at) {
          var u = clamp(((y - ks[i].at) / (ks[i + 1].at - ks[i].at) - .2) / .6);
          t = lerp(ks[i].f, ks[i + 1].f, reduce ? (u < .5 ? 0 : 1) : ease(u));
        }
      }
    }
    if (t === T.t) return;
    var p = T.path.getPointAtLength(T.L * t);
    T.path.style.strokeDashoffset = T.L * (1 - t);
    if (T.dot) T.dot.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
    T.nodes.forEach(function (nd) { nd.classList.toggle('on', +nd.getAttribute('data-t') <= t + .004); });
    S.el.style.setProperty('--t', t.toFixed(4));
    T.t = t;
  }

  /* ---------------------------------------------------------------- steps */
  function centre() { return stTop + (vh - stTop) / 2; }

  function camFor(S, n) {
    var c = null, any = false;
    S.steps.forEach(function (st, i) {
      var el = st.el, v = cam(narrow && el.getAttribute('data-camm') || el.getAttribute('data-cam'));
      if (v) { any = true; if (i < n) c = v; }
    });
    // before the first card, a scene that zooms in starts from the overview
    if (!c && any) c = cam(narrow && S.el.getAttribute('data-cam0m') || S.el.getAttribute('data-cam0')) || [S.camC[0], S.camC[1], 1];
    return c;
  }

  function onStep(S, n) {
    S.stage && S.stage.setAttribute('data-step', n);
    S.steps.forEach(function (st, i) { st.el.classList.toggle('is-active', i === n - 1); });
    if (S.cam) {
      var c = camFor(S, n);
      if (c) S.cam.style.transform = 'translate(' + S.camC[0] + 'px,' + S.camC[1] + 'px) scale(' + c[2] + ') translate(' + (-c[0]) + 'px,' + (-c[1]) + 'px)';
    }
    var ring = n ? +(S.steps[n - 1].el.getAttribute('data-ring') || 0) : 0, reached = 0;
    for (var q = 0; q < n; q++) reached = Math.max(reached, +(S.steps[q].el.getAttribute('data-ring') || 0));
    S.rings.forEach(function (r) { r.classList.toggle('on', +r.getAttribute('data-on') === ring); });
    S.marks.forEach(function (m) {
      var k = +m.getAttribute('data-seen');
      m.classList.toggle('seen', k <= reached);
      m.classList.toggle('is-current', k === ring);
    });
    if (S.spots.length) {
      S.spots.forEach(function (sp) {
        var k = +sp.getAttribute('data-n');
        sp.classList.toggle('seen', k <= n - 1);
        sp.classList.toggle('is-current', k === n - 1);
      });
    }
    if (S.ledger) {
      var L = 0;
      for (var i = 0; i < n; i++) { var v = +(S.steps[i].el.getAttribute('data-ledger') || 0); if (v) L = v; }
      S.stage.classList.toggle('ledger-on', L > 0);
      [].forEach.call(S.ledger.querySelectorAll('[data-row]'), function (row) {
        var on = +row.getAttribute('data-row') <= L, was = row.classList.contains('on');
        row.classList.toggle('on', on);
        var b = row.querySelector('b[data-v]');
        if (b && on && !was) countUp(b, +b.getAttribute('data-v'));
        if (b && !on) b.textContent = '€0';
      });
    }
    if (S.year) {
      var yr = null;
      for (var q2 = 0; q2 < Math.max(n, 1); q2++) { var yv = S.steps[q2] && S.steps[q2].el.getAttribute('data-year'); if (yv) yr = yv; }
      if (yr) yearTo(S.year, yr);
    }
    if (S.units) {
      var lv = 0;
      for (var q3 = 0; q3 < n; q3++) { var uv = +(S.steps[q3].el.getAttribute('data-units') || 0); if (uv) lv = uv; }
      unitsSet(S.units, lv);
    }
    keepUntil = Date.now() + 1600; // let the camera finish while anchored things follow it
    kick();
  }

  function countUp(el, to) {
    if (reduce) { el.textContent = '€' + fmt(to); return; }
    var t0 = null;
    (function f(ts) {
      t0 = t0 || ts;
      var u = Math.min(1, (ts - t0) / 750);
      el.textContent = '€' + fmt(to * (1 - Math.pow(1 - u, 3)));
      if (u < 1) w.requestAnimationFrame(f);
    })(performance.now());
  }

  // a year that counts up (or down) to the next one, or a word such as "Today"
  function yearTo(el, to) {
    var from = parseInt(el.textContent, 10), target = parseInt(to, 10);
    if (isNaN(target) || isNaN(from) || reduce) { el.textContent = to; return; }
    var t0 = null;
    (function f(ts) {
      t0 = t0 || ts;
      var u = Math.min(1, (ts - t0) / 700);
      el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1 - u, 3)));
      if (u < 1) w.requestAnimationFrame(f);
    })(performance.now());
  }

  /* ---------------------------------------------------------------- unit charts */
  // <canvas class="st-units" data-total="4561" data-groups="3507:#hex|1054:#hex" data-hi="263:#hex"
  // data-base="#hex">: layer 1 shows every square in the base colour, then each group colours in,
  // then the highlight. Squares change in reading order, so a new layer sweeps across the grid.
  function unitsInit(cv) {
    var g = (cv.getAttribute('data-groups') || '').split('|').map(function (x) { var p = x.split(':'); return { n: +p[0], c: p[1] }; });
    var h = (cv.getAttribute('data-hi') || '').split(':');
    var U = { cv: cv, ctx: cv.getContext('2d'), total: +cv.getAttribute('data-total'), groups: g, hi: { n: +h[0] || 0, c: h[1] }, base: cv.getAttribute('data-base') || '#444', level: 0, cur: [], anim: 0 };
    for (var i = 0; i < U.total; i++) U.cur.push(null);
    return U;
  }
  function unitsTarget(U, level) {
    var out = [], i, k = 0;
    for (i = 0; i < U.total; i++) out.push(level >= 1 ? U.base : null);
    U.groups.forEach(function (g, gi) { for (i = 0; i < g.n && k < U.total; i++, k++) if (level >= gi + 2) out[k] = g.c; });
    if (level >= U.groups.length + 2) for (i = 0; i < U.hi.n; i++) out[i] = U.hi.c;
    return out;
  }
  function unitsLayout(U) {
    var r = U.cv.getBoundingClientRect(), dpr = Math.min(2, w.devicePixelRatio || 1);
    if (!r.width || !r.height) return;
    U.cv.width = Math.round(r.width * dpr); U.cv.height = Math.round(r.height * dpr);
    U.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cell = Math.floor(Math.sqrt(r.width * r.height / U.total));
    while (cell > 2 && Math.floor(r.width / cell) * Math.floor(r.height / cell) < U.total) cell--;
    U.cell = cell; U.cols = Math.floor(r.width / cell);
    U.gx = (r.width - U.cols * cell) / 2; U.gy = (r.height - Math.ceil(U.total / U.cols) * cell) / 2;
    unitsDraw(U);
  }
  function unitsDraw(U) {
    var c = U.ctx, s = U.cell, gap = Math.max(1, s * .22), r = U.cv.getBoundingClientRect();
    c.clearRect(0, 0, r.width, r.height);
    for (var i = 0; i < U.total; i++) {
      if (!U.cur[i]) continue;
      c.fillStyle = U.cur[i];
      c.fillRect(U.gx + (i % U.cols) * s, U.gy + Math.floor(i / U.cols) * s, s - gap, s - gap);
    }
  }
  function unitsSet(U, level) {
    if (level === U.level && U.cell) return;
    U.level = level;
    var target = unitsTarget(U, level), changed = [];
    for (var i = 0; i < U.total; i++) if (target[i] !== U.cur[i]) changed.push(i);
    var id = ++U.anim, t0 = null;
    if (reduce || !changed.length) { U.cur = target; if (U.cell) unitsDraw(U); return; }
    (function f(ts) {
      if (id !== U.anim) return;
      t0 = t0 || ts;
      var u = Math.min(1, (ts - t0) / 1100), upto = Math.floor(changed.length * u);
      for (var j = 0; j < upto; j++) U.cur[changed[j]] = target[changed[j]];
      if (U.cell) unitsDraw(U);
      if (u < 1) w.requestAnimationFrame(f);
    })(performance.now());
  }

  /* ---------------------------------------------------------------- the guide */
  var shown = { screen: '', msgs: -1 };
  function pos(K) {
    if (K.v.a) {
      var el = K.anchor || (K.anchor = d.querySelector(K.v.a));
      if (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    }
    return { x: K.v.x / 100 * vw, y: stTop + K.v.y / 100 * (vh - stTop) };
  }
  function guide(y) {
    var k = narrow ? chainM : chain;
    if (!phone || !k.length) return;
    var i = 0;
    while (i < k.length - 1 && y >= k[i + 1].at) i++;
    var A = k[i], B = k[i + 1] || A, t = 0;
    if (B !== A && y > A.at) t = clamp((y - A.at) / (B.at - A.at));
    var e = reduce ? (t < .5 ? 0 : 1) : ease(clamp((t - .1) / .8));
    var pa = pos(A), pb = B === A ? pa : pos(B);
    var x = lerp(pa.x, pb.x, e), yy = lerp(pa.y, pb.y, e);
    var s = lerp(A.v.s, B.v.s, e), r = lerp(A.v.r, B.v.r, e), rx = lerp(A.v.rx, B.v.rx, e), o = lerp(A.v.o, B.v.o, e);
    if (y < A.at && i === 0) { x = pa.x; yy = pa.y; }
    phone.style.transform = 'translate3d(' + (x - pw / 2).toFixed(1) + 'px,' + (yy - ph / 2).toFixed(1) + 'px,0) perspective(900px) rotateX(' + rx.toFixed(1) + 'deg) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
    phone.style.opacity = o.toFixed(3);
    var cur = t >= .55 ? B : A;
    screen(cur.v.screen, cur.v.msgs);
  }
  function screen(name, msgs) {
    if (!screens || (name === shown.screen && msgs === shown.msgs)) return;
    if (name === 'notify' && shown.screen === 'lock' && !reduce) {
      phone.classList.remove('buzz'); void phone.offsetWidth; phone.classList.add('buzz');
    }
    if (name !== shown.screen) phone.setAttribute('data-screen', name);
    var chat = name.indexOf('chat-') === 0 ? name.slice(5).split('-')[0] : null;
    if (chat) {
      var box = phone.querySelector('[data-chat="' + chat + '"]');
      if (box) [].forEach.call(box.querySelectorAll('.b'), function (b, j) { b.classList.toggle('on', j < msgs); });
    }
    shown.screen = name; shown.msgs = msgs;
  }

  /* ---------------------------------------------------------------- layout and frames */
  function layout() {
    vw = w.innerWidth; vh = w.innerHeight; narrow = vw < 760;
    stTop = parseFloat(getComputedStyle(root).getPropertyValue('--st-top')) || 0;
    var y = w.scrollY || w.pageYOffset;
    sections.forEach(function (S) {
      var r = S.el.getBoundingClientRect();
      S.top = r.top + y; S.h = S.el.offsetHeight;
      S.steps.forEach(function (st) { var q = st.el.getBoundingClientRect(); st.c = q.top + y + q.height / 2; });
      S.active = -1;
    });
    var mr = main.getBoundingClientRect(); mainTop = mr.top + y; mainH = main.offsetHeight;
    [chain, chainM].forEach(function (k) {
      k.forEach(function (K) { var q = K.el.getBoundingClientRect(); K.at = q.top + y + q.height / 2 - centre(); K.anchor = null; });
    });
    if (phone) { pw = phone.offsetWidth; ph = phone.offsetHeight; }
    sections.forEach(function (S) { if (S.units) unitsLayout(S.units); });
    kick();
  }

  function frame() {
    ticking = false;
    var y = w.scrollY || w.pageYOffset, line = y + stTop + (vh - stTop) * .62;
    sections.forEach(function (S) {
      var n = 0;
      for (var j = 0; j < S.steps.length; j++) if (S.steps[j].c <= line) n = j + 1;
      if (n !== S.active) { S.active = n; onStep(S, n); }
      if (S.progress) {
        var p = clamp((y + stTop - S.top) / Math.max(1, S.h - (vh - stTop)));
        S.el.style.setProperty('--p', p.toFixed(4));
        // --pl: how far through the section the plane line (30% down the screen) is
        S.el.style.setProperty('--pl', clamp((y + vh * .3 - S.top) / Math.max(1, S.h)).toFixed(4));
      }
      var near = y + vh > S.top - vh && y < S.top + S.h + vh;
      if (S.map && near) mapFrame(S, y);
      if (S.track && near) trackFrame(S, y);
    });
    guide(y);
    // chapter rail and reading progress
    var cur = null;
    rail.forEach(function (R) { if (R.S.top <= y + vh * .4) cur = R; });
    rail.forEach(function (R) { if (R === cur) R.b.setAttribute('aria-current', 'step'); else R.b.removeAttribute('aria-current'); });
    var railEl = d.querySelector('.st-rail'), lastS = sections[sections.length - 1];
    if (railEl) {
      railEl.setAttribute('data-tone', cur && cur.S.el.classList.contains('st-light') ? 'light' : 'dark');
      // out of the way once the story hands over to the article
      if (y > lastS.top + lastS.h - vh * .6) railEl.setAttribute('data-off', ''); else railEl.removeAttribute('data-off');
    }
    var bar = d.querySelector('.st-progress');
    if (bar) bar.style.setProperty('--sp', clamp((y - mainTop) / Math.max(1, mainH - vh)).toFixed(4));
    if (Date.now() < keepUntil) kick();
  }
  function kick() { if (!ticking) { ticking = true; w.requestAnimationFrame(frame); } }

  w.addEventListener('scroll', kick, { passive: true });
  w.addEventListener('resize', function () { clearTimeout(layout.t); layout.t = setTimeout(layout, 120); });
  w.addEventListener('load', layout);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(layout);
  // the site header is injected by app.js after this runs, so measure again once it is in
  setTimeout(layout, 400);
  layout();
})();
