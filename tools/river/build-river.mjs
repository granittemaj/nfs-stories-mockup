// Draws src/scenes/river.svg for Upstream: one river, 6000 x 1000, from rescue downstream (left)
// to the source (right). The story pans along it as you scroll. No dependencies, seeded.
import { writeFileSync } from 'node:fs';

const W = 6000, H = 1000, WATER = 660;
let seed = 3;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const rr = (a, b) => a + rnd() * (b - a);
const pick = a => a[Math.floor(rnd() * a.length)];
const f = Math.round;
const out = [];

// a folded paper boat, centred on 0,0 (about 60 wide)
const BOAT = '<path d="M-30 0h60l-12 14h-36Z" fill="#fbf8f2"/><path d="M-30 0l30-30v30Z" fill="#efe6d6"/><path d="M0 -30l18 30H0Z" fill="#fbf8f2"/><path d="M-18 7h36" stroke="#F5821F" stroke-width="3"/>';
// (position on the outer group, animation on the inner one: a CSS transform would replace the
// transform attribute)
const boat = (x, y, s = 1, r = 0, cls = 'rv-boat') => `<g transform="translate(${f(x)} ${f(y)}) rotate(${r.toFixed(0)}) scale(${s})"><g class="${cls}" style="--d:${rr(0, 3).toFixed(2)}s">${BOAT}</g></g>`;
// a label on a post: a pill with a dot, shown once its step is reached
const tag = (x, y, text, n, w) => `<g transform="translate(${f(x)} ${f(y)})"><g class="rv-tag" data-seen="${n}"><path d="M0 0v${f(WATER - 40 - y)}" stroke="#141210" stroke-width="2" stroke-dasharray="4 6" opacity=".5"/><rect x="${f(-w / 2)}" y="-46" width="${f(w)}" height="46" rx="23"/><circle cx="${f(-w / 2 + 24)}" cy="-23" r="7"/><text x="${f(-w / 2 + 40)}" y="-15">${text}</text></g></g>`;

/* sky, sun, hills */
out.push(`<defs>
<linearGradient id="rv-sky" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#28323b"/><stop offset=".33" stop-color="#6f8a93"/><stop offset=".66" stop-color="#cfe0da"/><stop offset="1" stop-color="#f6e3bd"/></linearGradient>
<linearGradient id="rv-water" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c4750"/><stop offset=".5" stop-color="#4F8E92"/><stop offset="1" stop-color="#8cc0b2"/></linearGradient>
<linearGradient id="rv-hill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4650"/><stop offset=".45" stop-color="#6c8a74"/><stop offset="1" stop-color="#9db06d"/></linearGradient>
<radialGradient id="rv-sun"><stop offset="0" stop-color="#fff3d6"/><stop offset=".25" stop-color="#ffd59a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
</defs>`);
out.push(`<rect width="${W}" height="${H}" fill="url(#rv-sky)"/>`);
out.push(`<circle cx="5560" cy="300" r="320" fill="url(#rv-sun)"/><circle cx="5560" cy="300" r="70" fill="#fff3d6"/>`);
// mountains at the source
out.push(`<path d="M4700 620L5000 260 5180 420 5420 180 5700 470 5880 300 6000 380V620Z" fill="#8a9f7a"/><path d="M5420 180l-60 70 40-6 20 30 26-40 40 10Z" fill="#f4ecdf"/><path d="M5000 260l-40 48 30-4 14 22 20-30Z" fill="#f4ecdf"/>`);
let hill = 'M0 620';
for (let x = 0; x <= W; x += 150) hill += `L${x} ${f(520 + 50 * Math.sin(x / 420) + rr(-14, 14))}`;
out.push(`<path d="${hill}L${W} 620Z" fill="url(#rv-hill)" opacity=".7"/>`);

/* 1 · downstream: the city, a shelter, a rescue boat, a net */
for (let x = 0, i = 0; x < 1250; i++) {
  const w = rr(70, 130), h = rr(160, 330);
  out.push(`<rect x="${f(x)}" y="${f(620 - h)}" width="${f(w)}" height="${f(h)}" fill="${pick(['#1f262d', '#252d35', '#2a323a'])}"/>`);
  for (let wy = 620 - h + 20; wy < 600; wy += 30) for (let wx = x + 12; wx < x + w - 14; wx += 22) if (rnd() < .35) out.push(`<rect x="${f(wx)}" y="${f(wy)}" width="9" height="12" fill="#ffb466" opacity="${rr(.4, .9).toFixed(2)}"/>`);
  x += w + rr(4, 20);
}
out.push(`<g transform="translate(980 470)"><rect width="200" height="150" fill="#f3ede3"/><path d="M-14 0h228L100-70Z" fill="#C46F49"/><rect x="80" y="80" width="40" height="70" fill="#4F8E92"/><path d="M100 30c-8-12-26-6-22 8 2 8 22 22 22 22s20-14 22-22c4-14-14-20-22-8Z" fill="#F5821F"/></g>`);
out.push(`<rect y="616" width="1320" height="48" fill="#5d6266"/>`);

/* the river itself */
out.push(`<rect y="${WATER}" width="${W}" height="${H - WATER}" fill="url(#rv-water)"/>`);
let bank = `M0 ${WATER}`;
for (let x = 1300; x <= W; x += 100) bank += `L${x} ${f(WATER - 6 + rr(-8, 8))}`;
out.push(`<path d="M1300 600${bank.slice(bank.indexOf('L'))}L${W} 600Z" fill="#7d9a55"/>`);
out.push(`<path d="M1300 640${bank.slice(bank.indexOf('L'))}L${W} 676L1300 676Z" fill="#8a7350"/>`);
const flow = [];
for (let i = 0; i < 260; i++) { const x = rr(-100, W), y = rr(WATER + 30, H - 20); flow.push(`M${f(x)} ${f(y)}h${f(rr(30, 90))}`); }
out.push(`<g class="rv-flow"><path d="${flow.join('')}" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/></g>`);
// the net downstream, catching boats
out.push(`<g stroke="#e8dfd0" stroke-width="4" opacity=".85"><path d="M260 ${WATER - 30}v340M420 ${WATER - 30}v340"/><path d="M260 ${WATER + 20}h160M260 ${WATER + 70}h160M260 ${WATER + 120}h160M260 ${WATER + 170}h160M260 ${WATER + 220}h160M260 ${WATER + 270}h160" opacity=".6"/></g>`);
for (let i = 0; i < 9; i++) out.push(boat(440 + rr(0, 160), WATER + 40 + rr(0, 250), rr(.7, 1), rr(-20, 20)));
// the rescue boat
out.push(`<g transform="translate(700 790)"><path d="M-130 0h260l-34 46h-196Z" fill="#F5821F"/><rect x="-70" y="-60" width="110" height="60" rx="6" fill="#f3ede3"/><rect x="-56" y="-48" width="30" height="22" fill="#4F8E92"/><rect x="-16" y="-48" width="30" height="22" fill="#4F8E92"/><g fill="none" stroke="#f3ede3" stroke-width="9"><circle cx="90" cy="-14" r="18"/></g><circle cx="90" cy="-14" r="18" fill="none" stroke="#C46F49" stroke-width="9" stroke-dasharray="14 14"/></g>`);

/* 2 · the root causes, along the bank */
out.push(`<g transform="translate(1380 380)"><path d="M0 240V60l60-50v50l60-50v50l60-50v50l60-50v240Z" fill="#6f6a63"/><rect x="190" y="-90" width="26" height="110" fill="#5d5852"/><rect x="70" y="130" width="120" height="34" fill="#141210"/><text x="130" y="154" text-anchor="middle" font-family="var(--st-ui)" font-size="20" font-weight="700" letter-spacing="3" fill="#e8dfd0">CLOSED</text></g>`);
out.push(`<g transform="translate(1800 470)"><rect width="140" height="150" fill="#d9c39a"/><rect x="-10" y="-10" width="160" height="22" fill="#C46F49"/><rect x="20" y="40" width="100" height="40" fill="#141210"/><text x="70" y="68" text-anchor="middle" font-family="var(--st-ui)" font-size="22" font-weight="700" fill="#F5821F">LOANS</text><rect x="50" y="100" width="40" height="50" fill="#6b5640"/></g>`);
// the broken bridge
out.push(`<g fill="#6b5640"><path d="M2060 600l130 30v24l-130-30Z"/><path d="M2440 600l-120 34v24l120-34Z"/><rect x="2060" y="600" width="20" height="120"/><rect x="2420" y="600" width="20" height="120"/></g>`);
out.push(`<g stroke="#6b5640" stroke-width="5"><path d="M2200 648l18 60M2310 652l-10 70"/></g>`);
for (const [x, y, r] of [[2250, 700, 40], [2290, 760, -30], [2230, 830, 60]]) out.push(boat(x, y, .8, r, 'rv-boat rv-fall'));
out.push(`<g transform="translate(2560 440)"><path d="M0 180q80-170 260-170t200 170Z" fill="#9b8a5c"/><path d="M40 170q60-90 160-100" stroke="#7a6545" stroke-width="5" fill="none"/>${[30, 90, 150, 210, 270, 330].map(x => `<rect x="${x}" y="${f(140 - Math.sin(x / 120) * 60)}" width="14" height="20" fill="#5a4330"/>`).join('')}<path d="M260 120q60 10 110 60h-140Z" fill="#c9a86a"/></g>`);
out.push(`<g transform="translate(2930 480)"><rect width="150" height="140" fill="#a39b8e"/><rect x="20" y="40" width="110" height="60" fill="#6f6a63"/><path d="M20 50h110M20 60h110M20 70h110M20 80h110M20 90h110" stroke="#5d5852" stroke-width="3"/></g>`);
// drifting boats, more of them the further downstream
for (let i = 0; i < 26; i++) { const x = rr(450, 3100); out.push(boat(x, rr(WATER + 30, H - 40), rr(.55, .9), rr(-25, 25))); }

/* 3 · upstream interventions */
out.push(`<g transform="translate(3150 410)"><rect width="260" height="200" fill="#f3ede3"/><path d="M-16 0h292L130-80Z" fill="#C46F49"/><rect x="110" y="-130" width="40" height="60" fill="#f3ede3"/><path d="M104-130h52l-26-30Z" fill="#C46F49"/><path d="M130-160v-40" stroke="#141210" stroke-width="3"/><path d="M130-200h34l-8 10 8 10h-34Z" fill="#F5821F"/><g fill="#4F8E92"><rect x="24" y="40" width="50" height="50"/><rect x="186" y="40" width="50" height="50"/></g><rect x="104" y="110" width="52" height="90" fill="#5b7747"/></g>`);
out.push(`<g transform="translate(3560 450)"><rect width="230" height="160" fill="#efe2c8"/><path d="M-12 30h254l-20-40H8Z" fill="#F5821F"/><path d="M-12 30h254" stroke="#fff" stroke-width="6" stroke-dasharray="20 20"/><rect x="20" y="60" width="90" height="70" fill="#4F8E92"/><rect x="140" y="60" width="64" height="100" fill="#6b5640"/><g fill="#f3ede3"><rect x="30" y="72" width="30" height="20" rx="3"/><rect x="66" y="74" width="30" height="18" rx="3"/></g></g>`);
out.push(`<g transform="translate(3940 400)"><rect width="300" height="210" fill="#b9935e"/><path d="M-14 0h328L150-90Z" fill="#8a6440"/><rect x="110" y="90" width="80" height="120" fill="#6b5640"/><g fill="#d9b06a"><rect x="20" y="150" width="60" height="50" rx="4"/><rect x="220" y="150" width="60" height="50" rx="4"/></g></g>`);
out.push(`<rect x="4000" y="${WATER - 8}" width="240" height="22" fill="#8a6440"/><g fill="#6b5640"><rect x="4010" y="${WATER + 10}" width="12" height="60"/><rect x="4110" y="${WATER + 10}" width="12" height="60"/><rect x="4220" y="${WATER + 10}" width="12" height="60"/></g>`);
for (let i = 0; i < 5; i++) out.push(boat(4030 + i * 46, WATER + 40, .7, 0, 'rv-boat rv-moored'));
for (let i = 0; i < 16; i++) { const x = 4340 + i * 22, y = 600 - (i % 2) * 14; out.push(`<path d="M${x} ${y}v-${f(rr(20, 50))}" stroke="#5a4330" stroke-width="4"/><circle cx="${x}" cy="${f(y - rr(30, 60))}" r="${f(rr(14, 26))}" fill="${pick(['#5b7747', '#7fa856', '#6f9a4a'])}"/>`); }
// the safe bridge
out.push(`<g transform="translate(4580 0)"><path d="M0 600h300v40H0Z" fill="#a39b8e"/><path d="M20 640q130-120 260 0v380H20Z" fill="#8f877a"/><path d="M60 1000V680q90-80 180 0v320Z" fill="url(#rv-water)"/><path d="M0 590h300" stroke="#6f6a63" stroke-width="8"/></g>`);
// the village at the source
for (let i = 0; i < 7; i++) { const x = 5000 + i * 110 + rr(-20, 20), y = 560 + rr(-30, 10); out.push(`<g transform="translate(${f(x)} ${f(y)})"><rect width="70" height="56" fill="#f3ede3"/><path d="M-8 0h86L35-36Z" fill="${pick(['#C46F49', '#a85d3e', '#5b7747'])}"/><rect x="26" y="26" width="18" height="30" fill="#6b5640"/></g>`); }
out.push(`<path d="M5760 470q20 90 0 200" stroke="#cfe6e0" stroke-width="22" fill="none" stroke-linecap="round" opacity=".9"/>`);

/* labels */
out.push([
  tag(700, 300, 'Rescue', 1, 170), tag(1080, 380, 'Shelter', 1, 180),
  tag(1500, 240, 'No safe work', 2, 250), tag(1870, 370, 'Debt', 2, 140), tag(2250, 470, 'Unsafe migration', 2, 300), tag(3005, 390, 'No papers', 2, 210),
  tag(2790, 330, 'Damaged land', 3, 260),
  tag(3280, 230, 'School', 4, 160), tag(3675, 330, 'Safe work', 4, 200), tag(4090, 250, 'Cooperative', 4, 240), tag(4520, 420, 'Restored land', 4, 270), tag(4730, 470, 'A safe bridge', 4, 270),
  tag(5330, 380, 'Systems change', 5, 300),
].join(''));

writeFileSync(new URL('../../src/scenes/river.svg', import.meta.url),
  `<svg class="pn-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false">\n${out.join('\n')}\n</svg>\n`);
console.log('river.svg', (out.join('').length / 1024).toFixed(0) + 'KB');
