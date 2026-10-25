// Builds src/scenes/atlantic.svg for Slavery Changes Shape: the Atlantic world, 1500 to 1866, with
// the main routes of the transatlantic slave trade. Natural Earth shapes (world-atlas, 1:110m).
// Routes are drawn by broad region, thicker where more people were carried; they are not
// voyage data. Run: node build-atlantic.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';

const W = 1600, H = 1000;
const world = JSON.parse(readFileSync(new URL('./node_modules/world-atlas/countries-110m.json', import.meta.url)));
const land = feature(world, world.objects.countries);
const borders = mesh(world, world.objects.countries, (a, b) => a !== b);
const frame = { type: 'MultiPoint', coordinates: [[-108, -42], [48, -42], [-108, 62], [48, 62]] };
const projection = geoNaturalEarth1().rotate([30, 0]).fitExtent([[20, 20], [W - 20, H - 20]], frame).clipExtent([[-60, -60], [W + 60, H + 60]]);
const path = geoPath(projection).digits(0);
const P = (lon, lat) => projection([lon, lat]).map(v => +v.toFixed(0));

// an arc between two places, bowed to one side
function arc(a, b, bow = .18) {
  const [x1, y1] = P(...a), [x2, y2] = P(...b);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * bow, cy = my + dx * bow;
  return `M${x1} ${y1}Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x2} ${y2}`;
}
const AF = { wca: [12.3, -7.5], benin: [2.4, 6.3], biafra: [7.0, 4.6], gold: [-1.3, 5.1], seneg: [-16.6, 13.4] };
const AM = { rio: [-43.2, -22.9], salvador: [-38.5, -13.0], jamaica: [-76.8, 18.0], barbados: [-59.6, 13.1], domingue: [-72.3, 18.6], carolina: [-79.9, 32.8], cartagena: [-75.5, 10.4] };
const EU = { liverpool: [-3.0, 53.4], lisbon: [-9.1, 38.7], nantes: [-1.6, 47.2] };
// step: which card draws it; w: line weight
const routes = [
  ['t', EU.lisbon, AF.wca, 1, .12], ['t', EU.liverpool, AF.gold, 1, .1], ['t', EU.nantes, AF.benin, 1, .1],
  ['r', AF.wca, AM.rio, 2, -.12, 7], ['r', AF.wca, AM.salvador, 2, -.08, 6], ['r', AF.benin, AM.salvador, 2, -.1, 5],
  ['r', AF.biafra, AM.jamaica, 2, -.1, 4.5], ['r', AF.gold, AM.barbados, 2, -.1, 4], ['r', AF.benin, AM.domingue, 2, -.1, 4],
  ['r', AF.seneg, AM.carolina, 3, -.12, 2.2], ['r', AF.gold, AM.cartagena, 3, -.1, 2.5],
  ['b', AM.jamaica, EU.liverpool, 3, -.16], ['b', AM.salvador, EU.lisbon, 3, -.18],
];
const out = routes.map(([kind, a, b, step, bow, w]) =>
  kind === 'r'
    ? `<path class="at-route" data-seen="${step}" pathLength="1" stroke-width="${w}" d="${arc(a, b, bow)}"/>`
    : `<path class="at-trade" data-seen="${step}" pathLength="1" d="${arc(a, b, bow)}"/>`).join('');
const label = (t, lon, lat, cls = '') => { const [x, y] = P(lon, lat); return `<text class="at-label ${cls}" x="${x}" y="${y}">${t}</text>`; };
const dots = Object.values({ ...AF, ...AM, ...EU }).map(c => { const [x, y] = P(...c); return `<circle cx="${x}" cy="${y}" r="4"/>`; }).join('');

const svg = `<svg class="st-art at-map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
<rect class="at-sea" x="-800" y="-600" width="${W + 1600}" height="${H + 1200}"/>
<path class="at-land" d="${path(land)}"/>
<path class="at-borders" d="${path(borders)}"/>
<g class="at-routes">${out}</g>
<g class="at-dots">${dots}</g>
${label('Europe', 8, 50, 'big')}${label('West Africa', -2, 15, 'big')}${label('West Central Africa', 22, -4)}${label('Brazil', -52, -8, 'big')}${label('Caribbean', -71, 24)}${label('North America', -92, 40, 'big')}${label('Spanish Americas', -80, 3)}${label('Atlantic Ocean', -35, 25, 'sea')}
</svg>
`;
writeFileSync(new URL('../../src/scenes/atlantic.svg', import.meta.url), svg);
console.log('atlantic.svg', (svg.length / 1024).toFixed(0) + 'KB');
