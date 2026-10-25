/* Not For Sale stories hub: reveals, the reel (B), living posters (A, C), the contents preview (C)
   and the building-block glyphs. Plain JS, no dependencies; everything degrades to a readable page. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('hb-js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cache = {};
  function warm(url) { if (!cache[url]) { var i = new Image(); i.decoding = 'async'; i.src = url; cache[url] = i; } }
  function url(el, n) { return el.getAttribute('data-src').replace('{n}', n); }
  function each(sel, fn, ctx) { Array.prototype.forEach.call((ctx || document).querySelectorAll(sel), fn); }

  // reveal on scroll
  var rio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  each('.rv', function (el) { rio.observe(el); });

  // building-block glyphs (SMIL) run only while they are on screen; with reduced motion they hold a still frame
  var gio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.unpauseAnimations(); else e.target.pauseAnimations(); });
  });
  each('.bk-g svg', function (svg) {
    if (!svg.pauseAnimations) return;
    svg.pauseAnimations();
    if (reduce) svg.setCurrentTime(1.8); else gio.observe(svg);
  });

  // living posters: hover scrubs through the frames; touch screens (and data-auto) play them while on screen
  function poster(el) {
    var n = +el.getAttribute('data-n'), key = +el.getAttribute('data-key'), img = el.querySelector('img');
    var ticks = el.querySelectorAll('.lp-ticks i'), cur = 0, timer = 0, hovering = false, warmed = false;
    function show(k) {
      if (k === cur) return;
      cur = k;
      img.src = url(el, k);
      for (var i = 0; i < ticks.length; i++) ticks[i].classList.toggle('on', i === k - 1);
    }
    function load() { if (!warmed) { warmed = true; for (var k = 1; k <= n; k++) warm(url(el, k)); } }
    show(key);
    if (fine) {
      el.addEventListener('pointerenter', function () { hovering = true; load(); });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        show(Math.max(1, Math.min(n, 1 + Math.floor((e.clientX - r.left) / r.width * n))));
      });
      el.addEventListener('pointerleave', function () { hovering = false; if (!timer) show(key); });
    }
    if (reduce || (fine && !el.hasAttribute('data-auto'))) return;
    new IntersectionObserver(function (es) {
      var on = es[0].isIntersecting;
      el.classList.toggle('is-playing', on);
      if (on && !timer) { load(); timer = setInterval(function () { if (!hovering) show(cur % n + 1); }, 1500); }
      if (!on && timer) { clearInterval(timer); timer = 0; }
    }, { threshold: .5 }).observe(el);
  }
  each('.lp', poster);

  // B · the reel: each story takes the screen; scrolling through it plays its frames
  var reel = document.querySelector('.rl-reel');
  if (reel) {
    var steps = reel.querySelectorAll('.rl-step'), stories = reel.querySelectorAll('.rl-story');
    var bars = reel.querySelectorAll('.rl-bars i'), links = reel.querySelectorAll('.rl-index a');
    var frames = Array.prototype.map.call(stories, function (s) { return s.querySelectorAll('.rl-f'); });
    var shown = Array.prototype.map.call(stories, function () { return 0; });
    var active = -1, ticking = false;
    var loaded = [];
    var load = function (i) {
      if (i < 0 || i >= stories.length || loaded[i]) return;
      loaded[i] = true;
      each('[data-srcset]', function (el) { el.srcset = el.getAttribute('data-srcset'); el.removeAttribute('data-srcset'); }, stories[i]);
      each('[data-src]', function (el) { el.src = el.getAttribute('data-src'); el.removeAttribute('data-src'); }, stories[i]);
    };
    var update = function () {
      ticking = false;
      var vh = innerHeight, mid = vh * .5, now = 0;
      for (var i = 0; i < steps.length; i++) {
        var r = steps[i].getBoundingClientRect();
        // progress through the pinned part of the story: 0 when its card pins, 1 when it starts to leave
        var p = Math.max(0, Math.min(1, -r.top / (r.height - vh)));
        if (r.top <= mid) now = i;
        bars[i].style.setProperty('--p', p.toFixed(3));
        stories[i].style.setProperty('--p', p.toFixed(3));
        var f = Math.min(frames[i].length - 1, Math.floor(p * frames[i].length));
        if (f !== shown[i]) { frames[i][shown[i]].classList.remove('is-on'); frames[i][f].classList.add('is-on'); shown[i] = f; }
      }
      if (now !== active) {
        active = now;
        load(now); load(now + 1);
        for (var j = 0; j < steps.length; j++) {
          stories[j].classList.toggle('is-on', j === now);
          steps[j].classList.toggle('is-on', j === now);
          if (links[j]) { if (j === now) links[j].setAttribute('aria-current', 'true'); else links[j].removeAttribute('aria-current'); }
        }
      }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
    // jump links land where a story's card pins
    each('.rl-index a, .rl-cue', function (a) {
      a.addEventListener('click', function (e) {
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        var top = t.getBoundingClientRect().top + scrollY + 2;
        scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  // C · contents: on a desktop, a small trailer of the story follows the pointer over the list
  var list = document.querySelector('.tc-list'), fl = document.querySelector('.tc-float');
  if (list && fl && fine) {
    var fimg = fl.querySelector('img'), fticks = fl.querySelector('.lp-ticks');
    var row = null, k = 1, n = 1, timer = 0, x = 0, y = 0, tx = 0, ty = 0, raf = 0, w = 0, h = 0;
    var paint = function () {
      var ease = reduce ? 1 : .16;
      x += (tx - x) * ease; y += (ty - y) * ease;
      var tilt = reduce ? 0 : Math.max(-7, Math.min(7, (tx - x) * .06));
      // above and to the right of the pointer, so the row's own text stays readable (below it near the top of the screen)
      var top = y - h - 20 < 8 ? y + 30 : y - h - 20;
      fl.style.transform = 'translate3d(' + (x + 24) + 'px,' + top + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
      raf = (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) ? requestAnimationFrame(paint) : 0;
    };
    var go = function (i) {
      k = i;
      fimg.src = url(row, k);
      for (var t = 0; t < fticks.children.length; t++) fticks.children[t].classList.toggle('on', t === k - 1);
    };
    each('.tc-row > a', function (a) {
      a.addEventListener('pointerenter', function (e) {
        row = a; n = +a.getAttribute('data-n');
        for (var i = 1; i <= n; i++) warm(url(a, i));
        fticks.innerHTML = new Array(n + 1).join('<i></i>');
        w = fl.offsetWidth; h = fl.offsetHeight;
        if (!fl.classList.contains('is-on')) { x = tx = e.clientX; y = ty = e.clientY; }
        go(+a.getAttribute('data-key'));
        fl.classList.add('is-on');
        clearInterval(timer);
        if (!reduce) timer = setInterval(function () { go(k % n + 1); }, 750);
        if (!raf) raf = requestAnimationFrame(paint);
      });
    });
    list.addEventListener('pointermove', function (e) {
      tx = Math.min(e.clientX, innerWidth - w - 40); ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    });
    list.addEventListener('pointerleave', function () { fl.classList.remove('is-on'); clearInterval(timer); timer = 0; });
  }
})();
