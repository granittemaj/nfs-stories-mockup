// Draws the landscapes for The Forest Line (no dependencies): node tools/forest/build-flyover.mjs
//   assets/img/forest-flyover.svg  the long top-down flight: pasture, gold mining, the forest line,
//                                  forest (loaded as an image: one cached file, decoded off the page)
//   src/scenes/flyedge.svg         the forest line on its own, laid over the image and lit by a step
//   assets/img/forest-canopy.svg   the cold open: forest canopy at dawn, seen from above
// Everything is seeded, so a rebuild draws the same landscape. Illustrative, not a map.
import { writeFileSync } from 'node:fs';

const W = 1200, H = 7200;
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const rr = (a, b) => a + rnd() * (b - a);
const pick = a => a[Math.floor(rnd() * a.length)];
const f = v => Math.round(v);
const f1 = v => Math.round(v);

// a closed, slightly irregular blob
function blob(cx, cy, r, jag = .22, n = 10, sx = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, k = r * (1 + rr(-jag, jag));
    pts.push([cx + Math.cos(a) * k * sx, cy + Math.sin(a) * k]);
  }
  return smoothClosed(pts);
}
function smoothClosed(p) {
  const n = p.length;
  let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
}
function smoothOpen(p) {
  let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}
// sample a Catmull-Rom curve into a dense polyline (for distances and tangents)
function sample(p, steps = 24) {
  const out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const c = k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([c(0), c(1)]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
}
const near = (poly, x, y) => { let b = 1e9; for (const q of poly) { const d = (q[0] - x) ** 2 + (q[1] - y) ** 2; if (d < b) b = d; } return Math.sqrt(b); };
function at(poly, y) { // the polyline point closest to a given y, and its heading
  let bi = 0, bd = 1e9;
  poly.forEach((q, i) => { const d = Math.abs(q[1] - y); if (d < bd) { bd = d; bi = i; } });
  const a = poly[Math.max(0, bi - 2)], b = poly[Math.min(poly.length - 1, bi + 2)];
  return { x: poly[bi][0], y: poly[bi][1], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
}
const circ = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0`;
const rect = (x, y, w, h, a) => { // a rotated rectangle as a path
  const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180), hw = w / 2, hh = h / 2;
  const P = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
  return 'M' + P.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
};
// Round dots as zero-length strokes with round caps, grouped by colour and size: about a
// fifth of the bytes of one arc path per circle.
const dots = {};
const dot = (color, x, y, r) => { const k = color + '|' + Math.max(2, Math.round(r) * 2); (dots[k] = dots[k] || []).push(`M${f(x)} ${f(y)}h0`); };
const flushDots = (opacity = 1) => {
  const out = Object.entries(dots).map(([k, ds]) => { const [c, w] = k.split('|'); return `<path stroke="${c}" stroke-width="${w}" d="${ds.join('')}"/>`; }).join('');
  for (const k in dots) delete dots[k];
  return `<g fill="none" stroke-linecap="round"${opacity < 1 ? ` opacity="${opacity}"` : ''}>${out}</g>`;
};
const groups = {}; // fill colour -> path data, so thousands of shapes stay a few elements
const add = (fill, d) => { (groups[fill] = groups[fill] || []).push(d); };
const flush = (opacity = 1, extra = '') => {
  const out = Object.entries(groups).map(([c, ds]) => `<path fill="${c}"${opacity < 1 ? ` opacity="${opacity}"` : ''}${extra} d="${ds.join('')}"/>`).join('\n');
  for (const k in groups) delete groups[k];
  return out;
};

const parts = [];
const EDGE = 3100; // the forest line

/* ------------------------------------------------------------ 1. pasture by the highway, 0-900 */
parts.push(`<rect width="${W}" height="1000" fill="#a9b577"/>`);
for (let gy = -60; gy < 980; gy += 92) for (let gx = -80; gx < W + 80; gx += 128) {
  add(pick(['#b5bd7f', '#a2af6d', '#c3c08a', '#9aa865', '#b8b17a', '#aebc80']), rect(gx + rr(-6, 6), gy + rr(-6, 6), rr(112, 126), rr(78, 90), 7 + rr(-2, 2)));
}
parts.push(flush());
parts.push(`<g stroke="#8f9b5c" stroke-width="2" opacity=".55">${Array.from({ length: 14 }, (_, i) => `<path d="M-40 ${f(i * 74 - 20)}L1240 ${f(i * 74 + 140)}"/>`).join('')}</g>`);
// lone trees left standing in the fields, cattle
for (let i = 0; i < 70; i++) { const x = rr(0, W), y = rr(0, 860), r = rr(6, 13); dot('#1b2d17', x + 4, y + 5, r); dot(pick(['#3f5f2e', '#4c6b35']), x, y, r); }
parts.push(flushDots());
for (let i = 0; i < 9; i++) { const cx = rr(80, 1100), cy = rr(40, 820); for (let j = 0; j < rr(4, 10); j++) add('#f3efe6', rect(cx + rr(-26, 26), cy + rr(-18, 18), 5, 3, rr(0, 180))); }
parts.push(flush());
// burn scars and cut patches where the pasture meets the old forest
for (let i = 0; i < 16; i++) add(pick(['#3b3127', '#4a3b2c', '#5a4a36']), blob(rr(60, 1140), rr(820, 1000), rr(30, 80), .35, 9, 1.4));
parts.push(flush(.92));
for (let i = 0; i < 40; i++) { const x = rr(0, W), y = rr(860, 1040), r = rr(10, 22); dot('#2b4a26', x, y, r); }
parts.push(flushDots(.92));

/* ------------------------------------------------------------ 2. the mining zone, 1000-3100 */
parts.push(`<path fill="#d7c49e" d="M0 960${Array.from({ length: 13 }, (_, i) => `L${i * 100} ${f(980 + rr(-30, 30))}`).join('')}L1200 980V${EDGE + 80}H0Z"/>`);
for (let i = 0; i < 150; i++) add(pick(['#cdb88f', '#e3d4b1', '#c9b083', '#dccaa4']), blob(rr(-20, W + 20), rr(1000, EDGE + 40), rr(12, 48), .4, 8, rr(.8, 1.6)));
parts.push(flush(.85));
// dirt tracks
const tracks = [];
for (let i = 0; i < 26; i++) {
  const x0 = rr(0, W), y0 = rr(1040, EDGE - 60), pts = [[x0, y0]];
  for (let k = 0; k < 4; k++) pts.push([pts[k][0] + rr(-160, 160), pts[k][1] + rr(40, 140)]);
  tracks.push(`<path d="${smoothOpen(pts)}"/>`);
}
parts.push(`<g fill="none" stroke="#efe4c9" stroke-width="5" stroke-linecap="round" opacity=".8">${tracks.join('')}</g>`);
// pits, left as pools of murky water
const POOL = ['#6fb3a6', '#86b49a', '#9aa56a', '#a98f5c', '#4f7f78', '#7ea98a', '#b19a63'];
const pools = [];
for (let i = 0; i < 150; i++) {
  const x = rr(-30, W + 30), y = rr(1080, EDGE - 70), r = rr(16, 76);
  if (pools.some(p => Math.hypot(p.x - x, p.y - y) < (p.r + r) * .8)) continue;
  pools.push({ x, y, r, c: pick(POOL), sx: rr(.7, 1.6) });
}
pools.forEach(p => add('#ede3ca', blob(p.x, p.y, p.r + 5, .25, 9, p.sx)));
parts.push(flush());
pools.forEach(p => add(p.c, blob(p.x, p.y, p.r, .25, 9, p.sx)));
parts.push(flush());
pools.forEach(p => add('#ffffff', blob(p.x - p.r * .25, p.y - p.r * .2, p.r * .35, .3, 7, p.sx * 1.4)));
parts.push(flush(.18));
// a river, heavy with sediment, with dredges on it
const river1 = [[-60, 1720], [180, 1790], [420, 1930], [640, 2080], [860, 2210], [1020, 2340], [1260, 2420]];
const r1 = sample(river1);
// sandy banks, then muddy water with ripples, so it reads as a river and not a road
parts.push(`<path d="${smoothOpen(river1)}" fill="none" stroke="#e6d7b0" stroke-width="96" stroke-linecap="round"/>`);
parts.push(`<path d="${smoothOpen(river1)}" fill="none" stroke="#8e8256" stroke-width="66" stroke-linecap="round"/>`);
parts.push(`<path d="${smoothOpen(river1)}" fill="none" stroke="#9c9262" stroke-width="44" stroke-linecap="round"/>`);
const rip = [];
for (let i = 4; i < r1.length - 4; i += 7) { const [x, y] = r1[i], o = rr(-14, 14); rip.push(`M${f(x - 10)} ${f(y + o)}q6 -4 12 0t12 0`); }
parts.push(`<path d="${rip.join('')}" fill="none" stroke="#d8cfa6" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`);
// silt plumes drifting downstream from the dredges
for (const yy of [1840, 2020, 2180, 2330]) { const p = at(r1, yy); add('#d6c497', blob(p.x + 30, p.y + 14, 22, .4, 8, 2.2)); }
parts.push(flush(.55));
const dredges = [];
for (const yy of [1800, 1985, 2140, 2290]) {
  const p = at(r1, yy);
  dredges.push(`<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.ang)})"><path d="M14 0l50 -6M14 0l50 6" stroke="#e2cfa5" stroke-width="5" opacity=".7"/><rect x="-16" y="-9" width="32" height="18" rx="2" fill="#6f6c66"/><rect x="-11" y="-7" width="20" height="14" rx="1" fill="#3f7fc6"/><rect x="12" y="-2" width="16" height="4" fill="#3a3834"/></g>`);
}
parts.push(dredges.join(''));
// blue-tarp camps
const CAMP = [[430, 1820], [760, 1300], [300, 1260], [930, 1610], [560, 2560], [860, 2700], [240, 2420], [640, 1500], [1040, 2050], [380, 2850]];
for (const [cx, cy] of CAMP) {
  for (let j = 0; j < rr(5, 10); j++) {
    const x = cx + rr(-34, 34), y = cy + rr(-24, 24), w = rr(10, 18), h = rr(8, 13), a = rr(-12, 12);
    add('#2a241c', rect(x + 2, y + 3, w, h, a));
    add(pick(['#2f64a8', '#3f7fc6', '#24508c', '#e8e3d6', '#3f7fc6']), rect(x, y, w, h, a));
  }
}
parts.push(flush());
// excavators and pumps, dead trees
for (let i = 0; i < 16; i++) {
  const x = rr(80, 1120), y = rr(1100, EDGE - 120), a = rr(0, 360);
  parts.push(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><rect x="-8" y="-6" width="16" height="12" rx="2" fill="#e3a72a"/><rect x="-10" y="-8" width="20" height="3" fill="#3a3834"/><rect x="-10" y="5" width="20" height="3" fill="#3a3834"/><path d="M6 0h18l6 6" stroke="#3a3834" stroke-width="3" fill="none"/></g>`);
}
for (let i = 0; i < 120; i++) { const x = rr(0, W), y = rr(1040, EDGE - 40), r = rr(1.6, 3.6); dot('#7d776b', x, y, r); }
parts.push(flushDots());
// last islands of forest inside the mined land
for (let i = 0; i < 9; i++) {
  const cx = rr(60, 1140), cy = rr(1200, EDGE - 160);
  if (pools.some(p => Math.hypot(p.x - cx, p.y - cy) < p.r + 40)) continue;
  for (let j = 0; j < rr(5, 12); j++) { const x = cx + rr(-34, 34), y = cy + rr(-26, 26), r = rr(9, 17); dot('#1f3a1d', x + 4, y + 5, r); dot(pick(['#3b6b31', '#4a7a3a', '#2f5a2a']), x, y, r); }
}
parts.push(flushDots());

/* ------------------------------------------------------------ 3. the forest, ${EDGE}-7200 */
const edge = [];
for (let x = -40; x <= W + 40; x += 30) edge.push([x, EDGE + rr(-26, 26) + 40 * Math.sin(x / 150)]);
const edgePath = 'M' + edge.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
parts.push(`<path fill="#1d361b" d="${edgePath}L${W + 40} ${H + 20}H-40Z"/>`);
// the river through the forest, an oxbow lake, sandbars
const river2 = [[-60, 3520], [260, 3660], [700, 3840], [960, 4180], [880, 4520], [520, 4760], [330, 5090], [520, 5420], [800, 5700], [900, 6000], [700, 6320], [470, 6650], [440, 6980], [560, 7300]];
const r2 = sample(river2);
const oxbow = 'M960 5060C1100 5000 1180 5130 1120 5260C1080 5360 960 5380 900 5320C980 5300 1040 5240 1040 5170C1040 5110 1000 5080 960 5060Z';
// community clearing and the nursery: kept free of trees
const CLEAR = [{ x: 470, y: 5640, r: 150, sx: 1.25 }, { x: 760, y: 6460, r: 120, sx: 1.35 }];
const inClear = (x, y, pad = 0) => CLEAR.some(c => ((x - c.x) / (c.r * c.sx + pad)) ** 2 + ((y - c.y) / (c.r + pad)) ** 2 < 1);
// crowns
const CROWN = ['#2f5a2a', '#3b6b31', '#4a7a3a', '#335f2c', '#2a4f27', '#557f3f', '#406e35'];
const crowns = [];
for (let gy = EDGE - 20; gy < H + 40; gy += 40) for (let gx = -30; gx < W + 30; gx += 40) {
  const x = gx + rr(-16, 16), y = gy + rr(-16, 16), r = rr(20, 34);
  const ey = edge[Math.max(0, Math.min(edge.length - 1, Math.round((x + 40) / 30)))][1];
  if (y < ey + 6) continue;
  if (near(r2, x, y) < 52 + r * .4) continue;
  if (inClear(x, y, 10)) continue;
  crowns.push({ x, y, r, c: pick(CROWN) });
}
crowns.forEach(c => dot('#10200f', c.x + c.r * .22, c.y + c.r * .3, c.r));
parts.push(flushDots(.6));
crowns.forEach(c => dot(c.c, c.x, c.y, c.r));
parts.push(flushDots());
crowns.forEach(c => dot(pick(['#6f9a4a', '#7fa856', '#5f8c40']), c.x - c.r * .28, c.y - c.r * .3, c.r * .52));
parts.push(flushDots(.42));
// palms in the wet ground near the river
const palms = [];
for (let i = 0; i < 46; i++) {
  const p = r2[Math.floor(rr(0, r2.length))], x = p[0] + rr(-140, 140), y = p[1] + rr(-90, 90);
  if (near(r2, x, y) < 60 || y < EDGE + 60 || inClear(x, y, 20)) continue;
  const rays = Array.from({ length: 9 }, (_, k) => { const a = k / 9 * Math.PI * 2 + rr(0, .3), L = rr(14, 20); return `M${f1(x)} ${f1(y)}l${f1(Math.cos(a) * L)} ${f1(Math.sin(a) * L)}`; }).join('');
  palms.push(rays);
}
parts.push(`<path d="${palms.join('')}" stroke="#8fb35a" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".9"/>`);
// emergent Brazil nut trees: wider, paler crowns standing above the rest, with long shadows
const BN = [[760, 3790], [880, 3720], [690, 3900], [560, 3700], [300, 4050], [1040, 4420], [180, 4500], [660, 4400], [980, 4900], [140, 5000], [1080, 5600], [220, 5960], [1060, 6150], [300, 6420], [980, 6800], [170, 6900], [760, 7060], [640, 5280], [1120, 3600], [420, 4300]];
const bn = BN.filter(([x, y]) => near(r2, x, y) > 90 && !inClear(x, y, 40));
bn.forEach(([x, y]) => add('#0d1a0c', blob(x + 30, y + 40, 62, .2, 9)));
parts.push(flush(.5));
bn.forEach(([x, y]) => { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; dot(pick(['#8fb05a', '#9dbb66', '#86a852']), x + Math.cos(a) * 26, y + Math.sin(a) * 26, rr(26, 34)); } dot('#a9c473', x - 10, y - 12, 26); });
parts.push(flushDots());
bn.forEach(([x, y]) => dot('#cfe09a', x - 18, y - 20, 12));
parts.push(flushDots(.45));
// the river itself, drawn over the edges of the crowns
parts.push(`<path d="${oxbow}" fill="#1b3a33"/><path d="${oxbow}" fill="none" stroke="#6f9a4a" stroke-width="7" opacity=".6"/>`);
parts.push(`<path d="${smoothOpen(river2)}" fill="none" stroke="#7d5638" stroke-width="88" stroke-linecap="round"/>`);
parts.push(`<path d="${smoothOpen(river2)}" fill="none" stroke="#b58052" stroke-width="74" stroke-linecap="round"/>`);
parts.push(`<path d="${smoothOpen(river2.map(([x, y]) => [x - 14, y - 8]))}" fill="none" stroke="#d6a676" stroke-width="16" stroke-linecap="round" opacity=".28"/>`);
parts.push(`<path d="${smoothOpen(river2.map(([x, y]) => [x + 18, y + 10]))}" fill="none" stroke="#8f6440" stroke-width="10" stroke-linecap="round" opacity=".35"/>`);
for (const yy of [4180, 4760, 5700, 6320]) { const p = at(r2, yy); add('#e2cfa5', blob(p.x + (p.x > 700 ? -22 : 22), p.y, 30, .3, 8, 1.6)); }
parts.push(flush(.9));
// the harvesters' boat
const B = at(r2, 4640);
parts.push(`<g id="fl-boat" transform="translate(${f(B.x)} ${f(B.y)}) rotate(${f(B.ang)})"><path d="M-70 -10l-40 -16M-70 10l-40 16" stroke="#e6cfa8" stroke-width="4" opacity=".75"/><path d="M-34 0q4-10 30-10h40q14 0 22 10q-8 10-22 10h-40q-26 0-30-10Z" fill="#6b4a33"/><rect x="-14" y="-8" width="34" height="16" rx="2" fill="#4F8E92"/><g fill="#e8dcc0"><circle cx="-22" cy="-3" r="3"/><circle cx="-24" cy="4" r="3"/><circle cx="28" cy="0" r="3"/></g></g>`);
// the community: a clearing, a football pitch, houses, canoes
const C0 = CLEAR[0];
parts.push(`<path d="${blob(C0.x, C0.y, C0.r, .14, 12, C0.sx)}" fill="#9db06d"/><path d="${blob(C0.x + 40, C0.y + 10, C0.r * .7, .2, 10, 1.2)}" fill="#c2ad7f" opacity=".7"/>`);
parts.push(`<g transform="translate(${C0.x - 40} ${C0.y - 30}) rotate(-8)"><rect x="-50" y="-30" width="100" height="60" fill="#6f9a4a"/><rect x="-46" y="-26" width="92" height="52" fill="none" stroke="#f3efe6" stroke-width="2"/><path d="M0 -26v52" stroke="#f3efe6" stroke-width="2"/><circle r="8" fill="none" stroke="#f3efe6" stroke-width="2"/></g>`);
for (let i = 0; i < 13; i++) {
  const a = rr(0, Math.PI * 2), k = rr(.45, .9), x = C0.x + Math.cos(a) * C0.r * C0.sx * k * .9 + 30, y = C0.y + Math.sin(a) * C0.r * k * .8 + 10;
  if (Math.abs(x - (C0.x - 40)) < 64 && Math.abs(y - (C0.y - 30)) < 44) continue;
  const ang = rr(-20, 20);
  add('#3a2c1e', rect(x + 3, y + 4, 24, 16, ang));
  const roof = rnd() < .75 ? pick(['#c9a066', '#bf9558', '#d2ab72']) : pick(['#c9c9c2', '#b5603d']);
  add(roof, rect(x, y, 24, 16, ang));
}
parts.push(flush());
parts.push(`<g stroke="#e6d9bb" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"><path d="M${C0.x + 120} ${C0.y - 20}q60 10 110 0"/><path d="M${C0.x + 90} ${C0.y + 60}q70 10 120 -10"/></g>`);
for (let i = 0; i < 4; i++) { const p = at(r2, C0.y - 40 + i * 30); add('#3d2a1c', rect(p.x - 40, p.y + i * 4, 30, 6, 10)); }
parts.push(flush());
// the nursery: seed beds, a shade house, a young plot
const C1 = CLEAR[1];
parts.push(`<path d="${blob(C1.x, C1.y, C1.r, .12, 12, C1.sx)}" fill="#a68f66"/>`);
parts.push(`<g transform="translate(${C1.x - 70} ${C1.y - 60})"><rect width="100" height="64" fill="#dfe6d6" stroke="#9aa88a" stroke-width="2"/><path d="M0 16h100M0 32h100M0 48h100M25 0v64M50 0v64M75 0v64" stroke="#b9c4ae" stroke-width="1.5"/></g>`);
for (let row = 0; row < 6; row++) {
  parts.push(`<rect x="${C1.x + 44}" y="${C1.y - 64 + row * 18}" width="84" height="10" rx="2" fill="#6b5640"/>`);
  for (let k = 0; k < 10; k++) dot(pick(['#7fa856', '#8fb35a', '#6f9a4a']), C1.x + 49 + k * 8, C1.y - 59 + row * 18, 2.6);
}
for (let gx = 0; gx < 9; gx++) for (let gy = 0; gy < 4; gy++) dot(pick(['#5f8c40', '#7fa856']), C1.x - 120 + gx * 24, C1.y + 34 + gy * 22, rr(5, 8));
parts.push(flushDots());

/* ------------------------------------------------------------ the forest line itself, highlighted when reached */
// fallen logs along the edge
for (let i = 0; i < 40; i++) { const e = edge[Math.floor(rr(0, edge.length))]; add('#6b5640', rect(e[0] + rr(-10, 10), e[1] - rr(8, 30), rr(20, 40), 4, rr(0, 180))); }
parts.push(flush());

writeFileSync(new URL('../../assets/img/forest-flyover.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n${parts.join('\n')}\n</svg>\n`);
writeFileSync(new URL('../../src/scenes/flyedge.svg', import.meta.url),
  `<svg class="fly-edge" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="fl-edge" data-seen="4" d="${edgePath}"/><g class="st-ring" data-on="7" transform="translate(${C0.x} ${C0.y})"><circle r="200"/><circle r="200"/></g></svg>\n`);

/* ------------------------------------------------------------ the cold open: canopy at dawn, from above */
seed = 5;
const CW = 1600, CH = 1000, cp = [`<rect width="${CW}" height="${CH}" fill="#14261a"/>`];
const cc = [];
for (let gy = -30; gy < CH + 40; gy += 44) for (let gx = -30; gx < CW + 40; gx += 44) cc.push({ x: gx + rr(-18, 18), y: gy + rr(-18, 18), r: rr(22, 38), c: pick(['#22401f', '#2b4c26', '#1d3a1b', '#30552b']) });
cc.forEach(c => dot('#0b160b', c.x + 8, c.y + 10, c.r));
cp.push(flushDots(.6));
cc.forEach(c => dot(c.c, c.x, c.y, c.r));
cp.push(flushDots());
cc.forEach(c => dot('#4f7a3c', c.x - c.r * .3, c.y - c.r * .3, c.r * .5));
cp.push(flushDots(.4));
for (const [x, y] of [[420, 300], [1180, 620], [760, 820], [1400, 220]]) { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; dot('#5f8a43', x + Math.cos(a) * 26, y + Math.sin(a) * 26, 30); } }
cp.push(flushDots());
writeFileSync(new URL('../../assets/img/forest-canopy.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" preserveAspectRatio="xMidYMid slice">\n${cp.join('\n')}\n</svg>\n`);

const kb = n => (n / 1024).toFixed(0) + 'KB';
const D = at(r1, 2140);
console.log('dredge at', f(D.x), f(D.y), 'clearing', C0.x, C0.y, 'nursery', C1.x, C1.y);
console.log('flyover', kb(parts.join('').length), 'crowns', crowns.length, 'brazil nut trees', bn.length, 'boat at', f(B.x), f(B.y));
