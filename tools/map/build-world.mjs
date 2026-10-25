// Builds src/scenes/world.svg for When the Land Breaks: a world map (Natural Earth 1:110m, Equal
// Earth projection) with the three regions from the article's table, plus Madre de Dios.
// Run: node build-world.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const W = 1600, H = 820;
const world = JSON.parse(readFileSync(new URL('./node_modules/world-atlas/countries-110m.json', import.meta.url)));
const land = feature(world, world.objects.countries);
land.features = land.features.filter(f => f.id !== '010'); // no Antarctica
const projection = geoEqualEarth().fitExtent([[20, 20], [W - 20, H - 20]], land);
const path = geoPath(projection).digits(0);
const P = (lon, lat) => projection([lon, lat]).map(v => +v.toFixed(0));
// [n (the step that lights it), label, lon, lat, radius, label side]
const regions = [
  [1, 'The Amazon', -62, -6, 110, 'l'],
  [2, 'Southeast Asia', 108, 6, 105, 'b'],
  [3, 'Sub-Saharan Africa', 18, 4, 130, 'b'],
  [4, 'Madre de Dios, Peru', -70.5, -12.5, 26, 'l'],
];
const marks = regions.map(([n, name, lon, lat, r, side]) => {
  // label to the left (l), right (r) or below (b) the circle
  const [x, y] = P(lon, lat), tx = side === 'l' ? x - r - 16 : side === 'r' ? x + r + 16 : x;
  const ty = side === 'b' ? y + r + 40 : y + 9, anchor = side === 'l' ? 'end' : side === 'r' ? 'start' : 'middle';
  return `<g class="wm-region" data-seen="${n}"><circle class="wm-glow" cx="${x}" cy="${y}" r="${r}"/><circle class="wm-ring" cx="${x}" cy="${y}" r="${r}"/><text x="${tx}" y="${ty}" text-anchor="${anchor}">${name}</text></g>`;
}).join('');
const svg = `<svg class="st-art wm-map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
<path class="wm-land" d="${path(land)}"/>
${marks}
</svg>
`;
writeFileSync(new URL('../../src/scenes/world.svg', import.meta.url), svg);
console.log('world.svg', (svg.length / 1024).toFixed(0) + 'KB');
