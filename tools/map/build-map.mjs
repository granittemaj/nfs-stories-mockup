// Builds src/scenes/map.svg: a night map of Europe with Ana's route, from Natural Earth
// country shapes (world-atlas, 1:50m). Run: npm install && npm run build
import { readFileSync, writeFileSync } from 'node:fs';
import { geoConicConformal, geoPath, geoContains, geoDistance } from 'd3-geo';
import { feature, mesh } from 'topojson-client';

const W = 1600, H = 1100;
const world = JSON.parse(readFileSync(new URL('./node_modules/world-atlas/countries-50m.json', import.meta.url)));
const countries = feature(world, world.objects.countries);
const borders = mesh(world, world.objects.countries, (a, b) => a !== b);

// Frame: the North Sea to the Black Sea.
const frame = { type: 'MultiPoint', coordinates: [[-2, 43.2], [31.5, 43.2], [-2, 55.6], [31.5, 55.6]] };
const projection = geoConicConformal().rotate([-15, 0]).parallels([44, 58])
  .fitExtent([[40, 40], [W - 40, H - 40]], frame)
  .clipExtent([[-20, -20], [W + 20, H + 20]]);
const path = geoPath(projection).digits(0);

// The minibus route, roughly along the motorways (lon, lat).
const stops = [
  ['home', "Ana's town", 27.73, 46.64],
  ['cluj', 'Cluj-Napoca', 23.59, 46.77],
  ['oradea', 'Oradea', 21.92, 47.06],
  ['budapest', 'Budapest', 19.04, 47.50],
  ['vienna', 'Vienna', 16.37, 48.21],
  ['linz', 'Linz', 14.29, 48.31],
  ['nuremberg', 'Nuremberg', 11.08, 49.45],
  ['frankfurt', 'Frankfurt', 8.68, 50.11],
  ['cologne', 'Cologne', 6.96, 50.94],
  ['amsterdam', 'Amsterdam', 4.90, 52.37],
];
const pts = stops.map(s => projection([s[2], s[3]]).map(v => +v.toFixed(1)));

// Catmull-Rom through the stops, as cubic Béziers, so the line reads as a road rather than a polyline.
function smooth(p) {
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1.map(v => v.toFixed(1))} ${c2.map(v => v.toFixed(1))} ${p2[0]},${p2[1]}`;
  }
  return d;
}
let km = 0;
for (let i = 1; i < stops.length; i++) km += geoDistance([stops[i - 1][2], stops[i - 1][3]], [stops[i][2], stops[i][3]]) * 6371;
const roadKm = Math.round(km * 1.12 / 100) * 100; // roads run longer than the straight line

// Night lights: clusters around cities plus a thin rural scatter, kept on land. Seeded, so the
// map is the same on every build.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const gauss = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
const cities = [
  ['London', -0.13, 51.51, 3], ['Paris', 2.35, 48.86, 3], ['Brussels', 4.35, 50.85, 2], ['Amsterdam', 4.90, 52.37, 2],
  ['Rotterdam', 4.48, 51.92, 1.5], ['Cologne', 6.96, 50.94, 2], ['Ruhr', 7.2, 51.45, 2.5], ['Frankfurt', 8.68, 50.11, 2],
  ['Hamburg', 9.99, 53.55, 2], ['Berlin', 13.40, 52.52, 2.6], ['Munich', 11.58, 48.14, 2], ['Stuttgart', 9.18, 48.78, 1.6],
  ['Nuremberg', 11.08, 49.45, 1.2], ['Zurich', 8.54, 47.37, 1.4], ['Milan', 9.19, 45.46, 2.6], ['Turin', 7.69, 45.07, 1.6],
  ['Lyon', 4.84, 45.76, 1.6], ['Prague', 14.42, 50.08, 1.8], ['Vienna', 16.37, 48.21, 2], ['Bratislava', 17.11, 48.15, 1],
  ['Budapest', 19.04, 47.50, 2], ['Warsaw', 21.01, 52.23, 2], ['Krakow', 19.94, 50.06, 1.4], ['Wroclaw', 17.04, 51.11, 1.1],
  ['Katowice', 19.02, 50.26, 1.6], ['Zagreb', 15.98, 45.81, 1.1], ['Ljubljana', 14.51, 46.06, 0.8], ['Belgrade', 20.46, 44.79, 1.5],
  ['Bucharest', 26.10, 44.43, 2], ['Cluj', 23.59, 46.77, 1], ['Iasi', 27.60, 47.16, 0.9], ['Timisoara', 21.23, 45.75, 0.8],
  ['Chisinau', 28.86, 47.01, 0.9], ['Kyiv', 30.52, 50.45, 2.2], ['Lviv', 24.03, 49.84, 1], ['Odesa', 30.72, 46.48, 1.2],
  ['Sofia', 23.32, 42.70, 1.4], ['Copenhagen', 12.57, 55.68, 1.4], ['Gdansk', 18.65, 54.35, 1], ['Poznan', 16.93, 52.41, 0.9],
  ['Leipzig', 12.37, 51.34, 1], ['Dresden', 13.74, 51.05, 0.9], ['Hanover', 9.73, 52.37, 1], ['Strasbourg', 7.75, 48.58, 0.8],
  ['Venice', 12.33, 45.44, 1.2], ['Graz', 15.44, 47.07, 0.7], ['Brno', 16.61, 49.20, 0.8], ['Kosice', 21.26, 48.72, 0.6],
  ['Debrecen', 21.63, 47.53, 0.6], ['Oradea', 21.92, 47.06, 0.5], ['Brasov', 25.60, 45.65, 0.7], ['Constanta', 28.63, 44.17, 0.7],
  ['Vaslui', 27.73, 46.64, 0.35], ['Minsk', 27.56, 53.90, 1.6], ['Vilnius', 25.28, 54.69, 1], ['Lille', 3.06, 50.63, 1.2],
  ['Birmingham', -1.89, 52.48, 1.8], ['Manchester', -2.24, 53.48, 1.8], ['Bologna', 11.34, 44.49, 1.2], ['Genoa', 8.93, 44.41, 1],
];
const onLand = (lon, lat) => countries.features.some(f => geoContains(f, [lon, lat]));
const lights = [];
for (const [, lon, lat, w] of cities) {
  const n = Math.round(14 * w);
  for (let i = 0; i < n; i++) {
    const r = 0.22 * Math.sqrt(w);
    const L = lon + gauss() * r * 1.4, A = lat + gauss() * r;
    if (!onLand(L, A)) continue;
    const p = projection([L, A]);
    if (!p) continue;
    lights.push([p[0], p[1], +(0.55 + rnd() * 1.6).toFixed(1), +(0.35 + rnd() * 0.65).toFixed(2)]);
  }
}
for (let i = 0; i < 900; i++) {
  const L = -2 + rnd() * 34, A = 43 + rnd() * 13;
  if (!onLand(L, A)) continue;
  const p = projection([L, A]);
  lights.push([p[0], p[1], +(0.4 + rnd() * 0.7).toFixed(1), +(0.15 + rnd() * 0.35).toFixed(2)]);
}
const glow = cities.filter(c => c[3] >= 1.4).map(([n, lon, lat, w]) => { const p = projection([lon, lat]); return `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="${(10 * w).toFixed(0)}"/>`; }).join('');

// Lights as three round-capped paths of zero-length strokes (one per brightness band): a tenth
// of the bytes of one <circle> per light.
const bands = [[0, 0.3, 1.2], [0.3, 0.6, 1.8], [0.6, 2, 2.6]].map(([lo, hi, w], i) =>
  `<path class="m-l${i}" stroke-width="${w}" d="${lights.filter(l => l[3] >= lo && l[3] < hi).map(l => `M${l[0].toFixed(0)} ${l[1].toFixed(0)}h0`).join('')}"/>`).join('');
const land = countries.features.map(f => path(f)).filter(Boolean).join('');
const svg = `<svg class="st-map" viewBox="0 0 ${W} ${H}" data-km="${roadKm}" aria-hidden="true" focusable="false">
<defs>
<radialGradient id="mGlow"><stop offset="0" stop-color="#ffb466" stop-opacity=".22"/><stop offset="1" stop-color="#ffb466" stop-opacity="0"/></radialGradient>
<filter id="mBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
<rect class="m-sea" width="${W}" height="${H}"/>
<path class="m-land" d="${land}"/>
<path class="m-borders" d="${path(borders)}"/>
<g class="m-glow" fill="url(#mGlow)">${glow}</g>
<g class="m-lights">${bands}</g>
<path class="m-route-ghost" d="${smooth(pts)}"/>
<path class="m-route-glow" d="${smooth(pts)}" filter="url(#mBlur)"/>
<path class="m-route" id="st-route" d="${smooth(pts)}"/>
<g class="m-stops">${stops.map((s, i) => `<g class="m-stop m-stop-${s[0]}" data-stop="${s[0]}" transform="translate(${pts[i][0]} ${pts[i][1]})"><circle class="m-ring" r="9"/><circle class="m-dot" r="4.5"/><text x="${s[0] === 'amsterdam' ? -14 : 14}" y="${s[0] === 'home' ? 26 : -12}" text-anchor="${s[0] === 'amsterdam' ? 'end' : 'start'}">${s[1].replace("'", '&#8217;')}</text></g>`).join('')}</g>
</svg>
`;
writeFileSync(new URL('../../src/scenes/map.svg', import.meta.url), svg);
console.log('map.svg', (svg.length / 1024).toFixed(0) + 'KB', 'lights', lights.length, 'route km', roadKm, 'stops', JSON.stringify(stops.map((s, i) => [s[0], pts[i]])));
