#!/usr/bin/env python3
"""Builds src/scenes/amsterdam.svg for A Bowl of Soup: Amsterdam's water and parks, from
OpenStreetMap (data (c) OpenStreetMap contributors, ODbL).

    curl -s --data-urlencode "data@query.overpass" https://overpass-api.de/api/interpreter -o osm.json
    python3 build-amsterdam.py

osm.json is not committed (2 MB); query.overpass is, so the map can be rebuilt."""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'src', 'scenes', 'amsterdam.svg')
S, W_, N, E = 52.345, 4.850, 52.395, 4.940
K = 1600 / ((E - W_) * math.cos(math.radians((S + N) / 2)))
H = round((N - S) * K)


def xy(lat, lon):
    return ((lon - W_) * math.cos(math.radians((S + N) / 2)) * K, (N - lat) * K)


def simplify(pts, tol=.9):  # Douglas-Peucker
    if len(pts) < 4:
        return pts
    def rec(a, b):
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1e-9
        best, bi = 0, -1
        for i in range(a + 1, b):
            d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
            if d > best:
                best, bi = d, i
        if best > tol:
            return rec(a, bi)[:-1] + rec(bi, b)
        return [pts[a], pts[b]]
    return rec(0, len(pts) - 1)


def ring_d(ring):
    pts = [xy(p['lat'], p['lon']) for p in ring]
    # a closed ring starts and ends on the same point, which Douglas-Peucker cannot measure
    # against: simplify the two halves separately
    m = len(pts) // 2
    pts = simplify(pts[:m + 1]) + simplify(pts[m:])[1:] if len(pts) > 6 else pts
    if len(pts) < 3:
        return ''
    return 'M' + 'L'.join(f'{x:.0f} {y:.0f}' for x, y in pts) + 'Z'


def join_rings(ways):
    """Multipolygon members come as pieces of rings: join them end to end."""
    pieces = [list(w) for w in ways if w]
    rings = []
    while pieces:
        cur = pieces.pop(0)
        changed = True
        while changed and (cur[0]['lat'], cur[0]['lon']) != (cur[-1]['lat'], cur[-1]['lon']):
            changed = False
            for i, p in enumerate(pieces):
                if (p[0]['lat'], p[0]['lon']) == (cur[-1]['lat'], cur[-1]['lon']):
                    cur += p[1:]
                elif (p[-1]['lat'], p[-1]['lon']) == (cur[-1]['lat'], cur[-1]['lon']):
                    cur += p[::-1][1:]
                else:
                    continue
                pieces.pop(i)
                changed = True
                break
        rings.append(cur)
    return rings


def shapes(el):
    if el['type'] == 'way' and 'geometry' in el:
        return [el['geometry']]
    if el['type'] == 'relation':
        return join_rings([m.get('geometry') for m in el.get('members', []) if m.get('type') == 'way'])
    return []


data = json.load(open(os.path.join(HERE, 'osm.json')))
water, parks, key = [], [], {}
for el in data['elements']:
    t = el.get('tags', {})
    ds = [ring_d(r) for r in shapes(el)]
    ds = [d for d in ds if d]
    if not ds:
        continue
    if t.get('leisure') == 'park':
        name = t.get('name', '')
        if name in ('Vondelpark', 'Westerpark'):
            key.setdefault(name, []).extend(ds)
        else:
            parks.extend(ds)
    else:
        water.extend(ds)

# Places in the story (lat, lon). The safe house is not shown: the work began in the Red Light
# District, drawn as an area. Hoftuin: Nieuwe Herengracht 18a.
PINS = [
    ('2012', 'Red Light District', 52.3735, 4.8990, 'area', 1),
    ('2015', 'Vondelpark', 52.3600, 4.8700, 'was', 2),
    ('2017', 'Hoftuin', 52.3668, 4.9050, 'now', 3),
    ('2020', 'Westerpark', 52.3862, 4.8770, 'was', 4),
]
pins = []
for year, name, lat, lon, kind, n in PINS:
    x, y = xy(lat, lon)
    if kind == 'area':
        pins.append(f'<g class="a-area" data-seen="{n}" transform="translate({x:.0f} {y:.0f})"><circle r="70"/><rect id="pin-{year}" x="-1" y="-1" width="2" height="2" fill="none"/><text class="a-y" y="-86">{year}</text><text class="a-n" y="104">{name}</text></g>')
    else:
        pins.append(f'<g class="a-pin a-{kind}" data-seen="{n}" transform="translate({x:.0f} {y:.0f})"><circle class="a-r" r="24"/><circle class="a-d" r="12"/><rect id="pin-{year}" x="-1" y="-1" width="2" height="2" fill="none"/><text class="a-y" y="-36">{year}</text><text class="a-n" y="52">{name}</text></g>')

svg = f'''<svg class="st-art a-map" viewBox="0 0 1600 {H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<g class="cam">
<rect class="a-land" x="-1600" y="-1600" width="4800" height="{H + 3200}"/>
<path class="a-park" d="{''.join(parks)}"/>
{''.join(f'<path class="a-park a-key" d="{"".join(v)}"/>' for v in key.values())}
<path class="a-water" fill-rule="evenodd" d="{''.join(water)}"/>
<g class="a-labels"><text x="{xy(52.3905, 4.9100)[0]:.0f}" y="{xy(52.3905, 4.9100)[1]:.0f}">IJ</text><text x="{xy(52.3635, 4.9010)[0]:.0f}" y="{xy(52.3635, 4.9010)[1]:.0f}">Amstel</text></g>
{''.join(pins)}
</g>
</svg>
'''
open(OUT, 'w').write(svg)
print('amsterdam.svg', len(svg) // 1024, 'KB', 'height', H, 'water', len(water), 'parks', len(parks), 'key', list(key))
