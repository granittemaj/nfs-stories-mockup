"""The stories hub, in three directions to choose from:

    A · Front page  (options/front-page/)  a broadsheet on paper: the stories as a front page
    B · The reel    (index.html)           a dark trailer: each story takes the screen and plays its frames as you scroll
    C · Contents    (options/contents/)    a typographic index: hover a title and a small trailer follows the cursor

All three share the story list, the frames in assets/img/posters (tools/posters), the building blocks
section and hub.css / hub.js. Every page gets a switcher between the three while they are under review."""

STORIES = [
    dict(slug='the-offer', t='The <em>Offer</em>', name='The Offer', cause='Human trafficking', c='rust',
         place='Across Europe to Amsterdam', mins=6, follow='Ana&#8217;s phone', n=6, key=2,
         dek='A job abroad, a minibus, a kitchen with a locked door, and the way out. Follow Ana&#8217;s phone from '
             'her mother&#8217;s kitchen table to a restaurant in Amsterdam, and on to Dignita.'),
    dict(slug='the-forest-line', t='The Forest <em>Line</em>', name='The Forest Line', cause='Ecocide', c='green',
         place='Madre de Dios, Peru', mins=7, follow='a small plane', n=5, key=3,
         dek='A low flight over the Peruvian Amazon, from the gold-mining pits to the forest that communities keep '
             'standing. Then one Brazil nut tree, and the loop that pays for the forest.'),
    dict(slug='a-bowl-of-soup', t='A Bowl of <em>Soup</em>', name='A Bowl of Soup', cause='Social enterprise', c='teal',
         place='Amsterdam', mins=6, follow='a bowl of soup', n=6, key=2,
         dek='How a soup program in an Amsterdam safe house grew into Dignita, a restaurant that trains survivors of '
             'trafficking for real jobs.'),
    dict(slug='slavery-changes-shape', t='Slavery Changes <em>Shape</em>', name='Slavery Changes Shape', cause='History', c='rust',
         place='From the ancient world to today', mins=7, follow='a thread', n=5, key=1,
         dek='From the first civilizations to the scam compounds of today: the long history of slavery, and of the '
             'fight against it.'),
    dict(slug='upstream', t='<em>Upstream</em>', name='Upstream', cause='Social innovation', c='teal',
         place='One river', mins=5, follow='a paper boat', n=5, key=2,
         dek='Social innovation in one river: why Not For Sale works on the causes of trafficking, not only on the '
             'harm they leave behind.'),
    dict(slug='when-the-land-breaks', t='When the Land <em>Breaks</em>', name='When the Land Breaks', cause='Ecocide', c='green',
         place='A mangrove coast, Southeast Asia', mins=5, follow='a fishing boat', n=5, key=1,
         dek='One coast, over time: how the destruction of an ecosystem pushes people toward traffickers, and how to '
             'stop it upstream.'),
]
MINUTES = sum(s['mins'] for s in STORIES)
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
         'stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')
LEAD = ('Visual stories in the spirit of the best newsroom graphics desks. Each one follows a single thing (a phone, '
        'a plane, a bowl of soup) through the places where our work happens.')


def frame(base, s, k, size='wide'):
    return f'{base}assets/img/posters/{s["slug"]}-{k}-{size}.webp'


def poster(base, s, size='wide', auto=False, eager=False):
    """A living poster: the story's key frame; hover scrubs through its frames, and on touch screens
    (or with `auto`) the frames play by themselves while it is on screen."""
    ticks = ''.join('<i></i>' for _ in range(s['n']))
    w, h = (800, 500) if size == 'thumb' else (1600, 1000)
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<div class="lp" data-src="{base}assets/img/posters/{s["slug"]}-{{n}}-{size}.webp" data-n="{s["n"]}" '
            f'data-key="{s["key"]}"{" data-auto" if auto else ""}>'
            f'<img src="{frame(base, s, s["key"], size)}" alt="" width="{w}" height="{h}" {load} decoding="async">'
            f'<span class="lp-ticks" aria-hidden="true">{ticks}</span></div>')


def kick(s):
    return f'<span class="hb-dot is-{s["c"]}" aria-hidden="true"></span>{s["cause"]}<span class="hb-sep">&#183;</span>{s["place"]}'


def read(base, s, cls):
    return f'<a class="{cls}" href="{base}{s["slug"]}/">Read the story<span class="st-sr">: {s["name"]}</span> {ARROW}</a>'


def switcher(base, current):
    opts = [('a', 'Front page', f'{base}options/front-page/'), ('b', 'The reel', base or './'),
            ('c', 'Contents', f'{base}options/contents/')]
    cur = ' aria-current="page"'
    links = ''.join(f'<a href="{href}"{cur if key == current else ""}>{key.upper()}<span> &#183; {label}</span></a>'
                    for key, label, href in opts)
    return (f'<nav class="hb-switch" aria-label="Hub mockups to compare"><span class="hb-switch-l">Hub mockup'
            f'<span>s for review</span></span>{links}</nav>')


# ------------------------------------------------------------------ building blocks
# Each block has a small animated glyph (SVG with SMIL; hub.js runs it only while it is on screen).
R = 'repeatCount="indefinite"'


def digits(x, dur):
    spans = ''.join(f'<tspan x="{x}" dy="{0 if i == 0 else 16}">{i % 10}</tspan>' for i in range(11))
    return (f'<g><text class="gd" x="{x}" y="38">{spans}</text>'
            f'<animateTransform attributeName="transform" type="translate" values="0 0;0 -160" dur="{dur}" {R}/></g>')


TREES = '<circle cx="16" cy="14" r="5"/><circle cx="40" cy="18" r="6"/><circle cx="26" cy="32" r="5"/><circle cx="48" cy="40" r="5"/><circle cx="15" cy="48" r="6"/><circle cx="35" cy="52" r="4"/>'
GLYPHS = {
    'guide': f'''<path class="l d" d="M8 52C20 52 18 30 32 30S44 10 56 10"/><circle class="a" cx="56" cy="10" r="3"/>
<rect class="a" x="-5" y="-8" width="10" height="16" rx="2.5"><animateMotion dur="4s" {R} path="M8 52C20 52 18 30 32 30S44 10 56 10" keyPoints="0;0;1;1" keyTimes="0;.15;.85;1" calcMode="spline" keySplines="0 0 1 1;.6 0 .4 1;0 0 1 1"/></rect>''',
    'sticky': f'''<defs><clipPath id="bkc2"><rect x="10" y="10" width="44" height="44" rx="5"/></clipPath></defs>
<rect class="f" x="10" y="10" width="44" height="44" rx="5"/><circle class="a" cx="42" cy="22" r="4"/><path class="t" d="M10 54V40q10-10 20-2t24-6v22Z"/>
<g clip-path="url(#bkc2)"><g><rect class="c" x="16" y="58" width="24" height="10" rx="2"/><rect class="c" x="22" y="84" width="24" height="10" rx="2"/><rect class="c" x="16" y="110" width="24" height="10" rx="2"/>
<animateTransform attributeName="transform" type="translate" values="0 0;0 -52" dur="4s" {R}/></g></g><rect class="l" x="10" y="10" width="44" height="44" rx="5"/>''',
    'route': f'''<path class="l d" d="M10 50L22 34L36 40L54 14"/>
<path class="al" pathLength="1" stroke-dasharray="1 1" d="M10 50L22 34L36 40L54 14"><animate attributeName="stroke-dashoffset" values="1;0;0;1" keyTimes="0;.6;.9;1" dur="4s" {R}/></path>
<circle class="c l" cx="22" cy="34" r="3"/><circle class="c l" cx="36" cy="40" r="3"/><circle class="a" cx="10" cy="50" r="4"/><circle class="a" cx="54" cy="14" r="4"/>''',
    'flyover': f'''<defs><clipPath id="bkc4"><rect x="8" y="8" width="48" height="48" rx="6"/></clipPath></defs>
<rect class="f" x="8" y="8" width="48" height="48" rx="6"/>
<g clip-path="url(#bkc4)"><g class="t">{TREES}<g transform="translate(0 -48)">{TREES}</g><animateTransform attributeName="transform" type="translate" values="0 0;0 48" dur="3.2s" {R}/></g></g>
<g class="a"><rect x="30.5" y="22" width="3" height="19" rx="1.5"/><rect x="21" y="28" width="22" height="4" rx="2"/><rect x="27" y="38" width="10" height="3" rx="1.5"/></g><rect class="l" x="8" y="8" width="48" height="48" rx="6"/>''',
    'circles': f'''<path class="l" d="M6 48h52"/><g class="t"><circle cx="13" cy="43" r="4"/><circle cx="22" cy="44" r="3.5"/><circle cx="50" cy="43" r="4"/></g><path class="al" d="M36 40v8"/>
<g transform="translate(36 25)"><g><circle class="c" r="14"/><circle class="al" r="14"/><path class="l" d="M0 9V1"/><circle class="t" cy="-2" r="6.5"/><circle class="a" cx="7" cy="-7" r="2.2"/>
<animateTransform attributeName="transform" type="scale" values="0;1;1;0" keyTimes="0;.25;.85;1" calcMode="spline" keySplines=".2 .8 .3 1;0 0 1 1;.6 0 .8 .2" dur="4s" {R}/></g></g>''',
    'cutaway': f'''<defs><clipPath id="bkc6"><rect x="14" y="28" width="36" height="26"/></clipPath></defs>
<path class="l" d="M10 29L32 11L54 29"/><path class="l" d="M14 41h36"/><circle class="a" cx="24" cy="34" r="2.6"/><rect class="a" x="22" y="37" width="4" height="4" rx="1"/><circle class="a" cx="40" cy="47" r="2.6"/><path class="l" d="M30 54v-4h6"/>
<g clip-path="url(#bkc6)"><g><rect class="f2" x="14" y="28" width="36" height="26"/><rect class="c" x="20" y="33" width="7" height="7"/><rect class="c" x="37" y="33" width="7" height="7"/><rect class="c" x="29" y="44" width="6" height="10"/>
<animateTransform attributeName="transform" type="translate" values="0 0;0 0;36 0;36 0;0 0" keyTimes="0;.15;.4;.85;1" calcMode="spline" keySplines="0 0 1 1;.6 0 .3 1;0 0 1 1;.6 0 .3 1" dur="4.6s" {R}/></g></g>
<rect class="l" x="14" y="28" width="36" height="26"/>''',
    'counter': f'''<defs><clipPath id="bkc7"><rect x="12" y="22" width="40" height="22" rx="4"/></clipPath></defs>
<rect class="c" x="12" y="22" width="40" height="22" rx="4"/><g clip-path="url(#bkc7)">{digits(22, "12s")}{digits(32, "3.6s")}{digits(42, "1.2s")}</g>
<rect class="l" x="12" y="22" width="40" height="22" rx="4"/><path class="al" d="M16 52h32"/>''',
    'signs': f'''<rect class="f" x="8" y="12" width="48" height="40" rx="4"/><path class="l" d="M8 40h48M18 40V26h10v14M36 26h12v8H36Z"/><rect class="l" x="8" y="12" width="48" height="40" rx="4"/>'''
    + ''.join(f'''<g transform="translate({x} {y})"><g><circle class="a" r="6.5"/><text class="gn" y="3.4">{i}</text>
<animateTransform attributeName="transform" type="scale" values="0;0;1;1;0" keyTimes="0;{a};{a + .08:.2f};.88;1" dur="4.5s" {R}/></g></g>'''
              for i, (x, y, a) in enumerate([(23, 22, .05), (44, 22, .25), (32, 46, .45)], 1)),
    'loop': f'''<circle class="l d" cx="32" cy="32" r="19"/><circle class="c l" cx="32" cy="13" r="4"/><circle class="c l" cx="51" cy="32" r="4"/><circle class="c l" cx="32" cy="51" r="4"/><circle class="c l" cx="13" cy="32" r="4"/>
<g><circle class="a" cx="32" cy="13" r="4.5"/><animateTransform attributeName="transform" type="rotate" values="0 32 32;360 32 32" dur="5s" {R}/></g>''',
    'year': f'''<defs><clipPath id="bkc10"><rect x="8" y="20" width="48" height="24" rx="5"/></clipPath></defs>
<rect class="c" x="8" y="20" width="48" height="24" rx="5"/>
<g clip-path="url(#bkc10)"><g><text class="gy" x="32" y="38">1500</text><text class="gy" x="32" y="62">1866</text><text class="gy" x="32" y="86">2000</text><text class="gy" x="32" y="110">1500</text>
<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -24;0 -24;0 -48;0 -48;0 -72" keyTimes="0;.24;.33;.57;.66;.9;1" dur="5s" {R}/></g></g>
<rect class="l" x="8" y="20" width="48" height="24" rx="5"/><path class="al" d="M14 52h36"/>''',
    'units': ''.join(f'<rect class="f" x="{10 + c * 12}" y="{10 + r * 12}" width="9" height="9" rx="1.5"/>' for r in range(4) for c in range(4))
    + ''.join(f'''<rect class="a" x="{10 + c * 12}" y="{10 + r * 12}" width="9" height="9" rx="1.5" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{(r * 4 + c) * .05:.2f};{(r * 4 + c) * .05 + .04:.2f};.9;1" dur="5s" {R}/></rect>'''
              for r in range(4) for c in range(4) if r * 4 + c < 11),
    'wipe': f'''<defs><clipPath id="bkc12"><rect x="54" y="10" width="44" height="44"><animate attributeName="x" values="54;54;10;10;54" keyTimes="0;.15;.5;.85;1" calcMode="spline" keySplines="0 0 1 1;.6 0 .3 1;0 0 1 1;.6 0 .3 1" dur="5s" {R}/></rect></clipPath></defs>
<rect class="f" x="10" y="10" width="44" height="44" rx="5"/><g class="t"><circle cx="20" cy="38" r="6"/><circle cx="31" cy="34" r="7"/><circle cx="43" cy="38" r="6"/></g><path class="l" d="M10 46h44"/>
<g clip-path="url(#bkc12)"><rect class="sand" x="10" y="10" width="44" height="44" rx="5"/><path class="l" d="M10 46h44M20 46v-4M31 46v-5M43 46v-4"/></g>
<path class="al" d="M54 8v48"><animate attributeName="d" values="M54 8v48;M54 8v48;M10 8v48;M10 8v48;M54 8v48" keyTimes="0;.15;.5;.85;1" calcMode="spline" keySplines="0 0 1 1;.6 0 .3 1;0 0 1 1;.6 0 .3 1" dur="5s" {R}/></path>
<rect class="l" x="10" y="10" width="44" height="44" rx="5"/>''',
    'thread': f'''<path class="l d" d="M32 6C18 16 46 26 32 34S18 50 32 58"/>
<path class="al" pathLength="1" stroke-dasharray="1 1" d="M32 6C18 16 46 26 32 34S18 50 32 58"><animate attributeName="stroke-dashoffset" values="1;0;0;1" keyTimes="0;.65;.9;1" dur="4.5s" {R}/></path>
<circle class="a" cx="32" cy="6" r="3.5"/>'''
    + ''.join(f'''<circle class="a" cx="32" cy="{y}" r="3.5" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{a};{a + .03:.2f};.9;1" dur="4.5s" {R}/></circle>''' for y, a in [(34, .33), (58, .63)]),
    'trail': ''.join(f'''<g><rect class="c l" x="{14 + dx}" y="{48 - i * 8}" width="34" height="7" rx="1.5"/>
<animateTransform attributeName="transform" type="translate" values="0 -18;0 -18;0 0;0 0;0 -18" keyTimes="0;{i * .17:.2f};{i * .17 + .12:.2f};.88;1" calcMode="spline" keySplines="0 0 1 1;.3 .6 .4 1;0 0 1 1;0 0 1 1" dur="4.8s" {R}/><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{i * .17:.2f};{i * .17 + .1:.2f};.88;.96" dur="4.8s" {R}/></g>'''
                     for i, dx in enumerate([0, 3, -2, 2])) + '<path class="l" d="M8 56h48"/>',
    'pan': f'''<defs><clipPath id="bkc15"><rect x="6" y="16" width="52" height="32" rx="4"/></clipPath></defs>
<rect class="f" x="6" y="16" width="52" height="32" rx="4"/>
<g clip-path="url(#bkc15)"><g><path class="t" d="M6 40l12-12 8 8 10-14 14 14 8-6 12 10 12-12 8 8 10-14 14 14 8-6 6 6v12H6Z"/><path class="w" d="M6 42h120v6H6Z"/>
<animateTransform attributeName="transform" type="translate" values="0 0;-60 0" dur="6s" {R}/></g></g>
<rect class="l" x="6" y="16" width="52" height="32" rx="4"/><circle class="a" cx="32" cy="45" r="2.5"/>''',
    'glossary': f'''<path class="c l" d="M32 16C26 13 18 13 12 15V50C18 48 26 48 32 51Z"/><path class="l" d="M17 23h10M17 29h10M17 35h7"/>
<g transform="translate(32 0)"><g><path class="c l" d="M0 16C6 13 14 13 20 15V50C14 48 6 48 0 51Z"/><path class="al" d="M5 23h10"/><path class="l" d="M5 29h10M5 35h7"/>
<animateTransform attributeName="transform" type="scale" values="1 1;1 1;-1 1;-1 1;1 1" keyTimes="0;.3;.5;.8;1" calcMode="spline" keySplines="0 0 1 1;.5 0 .5 1;0 0 1 1;.5 0 .5 1" dur="4.4s" {R}/></g></g>''',
    'timelapse': f'''<rect class="f" x="8" y="10" width="48" height="44" rx="5"/><path class="w" d="M8 44h48v5a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z"/>
<path class="l" d="M30 44V30"/><g transform="translate(30 26)"><g><circle class="t" r="11"/>
<animateTransform attributeName="transform" type="scale" values="1;1;0;0;1" keyTimes="0;.3;.42;.78;1" calcMode="spline" keySplines="0 0 1 1;.6 0 .8 .4;0 0 1 1;.2 .6 .3 1" dur="5s" {R}/></g></g>
<rect class="sand" x="38" y="38" width="13" height="6" rx="1" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.4;.48;.78;.86" dur="5s" {R}/></rect>
<rect class="l" x="8" y="10" width="48" height="44" rx="5"/>''',
}

BLOCKS = [
    ('guide', 'The guide', 'One object travels the whole story and lands on things: Ana&#8217;s phone, the plane over Madre de Dios, a paper boat.', ['the-offer', 'the-forest-line', 'upstream']),
    ('sticky', 'Sticky scenes', 'An illustration holds still while the text scrolls over it, and the camera moves to what each line is about.', ['the-offer', 'a-bowl-of-soup']),
    ('route', 'The route map', 'A route that draws itself as you scroll, with a distance bar and stops that light up.', ['the-offer']),
    ('flyover', 'The fly-over', 'One long picture scrolls under the guide, with a zone bar, like the Reuters Kill Zone flight.', ['the-forest-line']),
    ('circles', 'Close-up circles', 'Zoomed-in details that pop out of the landscape as you pass them.', ['the-forest-line', 'a-bowl-of-soup']),
    ('cutaway', 'The cut-away', 'A building or a tree opened up, with rings that point at what matters.', ['the-offer', 'the-forest-line']),
    ('counter', 'Counters', 'Numbers that add up as you read: in The Offer, a debt that can never be paid off.', ['the-offer']),
    ('signs', 'Spot the signs', 'Numbered markers on a scene, one sign per step, so readers learn what to look for.', ['the-offer']),
    ('loop', 'The loop', 'A diagram a dot travels around, step by step: from forest to bottle and back.', ['the-forest-line']),
    ('year', 'The year counter', 'A date that counts as the story moves through time, over a real map.', ['a-bowl-of-soup', 'slavery-changes-shape']),
    ('units', 'One square, one person', 'A unit chart that colors itself in, group by group, as you read.', ['a-bowl-of-soup', 'slavery-changes-shape']),
    ('wipe', 'Then and now', 'Two pictures of the same place; scrolling wipes from one to the other.', ['a-bowl-of-soup']),
    ('thread', 'The thread', 'A line that draws itself down the page, linking the eras of a long history.', ['slavery-changes-shape']),
    ('trail', 'The paper trail', 'Things that pile up as you read: here, a century of laws and treaties.', ['slavery-changes-shape']),
    ('pan', 'The panorama', 'One wide picture that pans sideways as you scroll down: a river walked upstream.', ['upstream']),
    ('glossary', 'The glossary', 'A dictionary page that turns with each card, one word at a time.', ['upstream']),
    ('timelapse', 'The time-lapse', 'One illustrated place that changes with each card: the coast, the ponds, the storm.', ['when-the-land-breaks']),
]
NAMES = {s['slug']: s['name'] for s in STORIES}


def blocks(base, dark=False):
    items = []
    for i, (g, name, desc, used) in enumerate(BLOCKS, 1):
        seen = ''.join(f'<a href="{base}{u}/">{NAMES[u]}</a>' for u in used)
        items.append(f'''<li class="bk-card rv" style="--d:{(i - 1) % 3}">
        <div class="bk-g" aria-hidden="true"><svg viewBox="0 0 64 64" focusable="false">{GLYPHS[g]}</svg></div>
        <div class="bk-t"><p class="bk-n">{i:02d}</p><h3>{name}</h3><p>{desc}</p><p class="bk-in"><span>Seen in</span>{seen}</p></div>
      </li>''')
    return f'''
  <section class="bk{" bk-dark" if dark else ""}" aria-labelledby="bk-h">
    <div class="bk-wrap">
      <div class="bk-head rv">
        <p class="st-kicker">The toolkit</p>
        <h2 id="bk-h">Seventeen building blocks, ready to become <em>WordPress blocks</em></h2>
        <p>Every story here is put together from the same parts. Each part would become a block the team can drop into a post, with the words and pictures of the next story.</p>
      </div>
      <ol class="bk-grid">
      {"".join(items)}
      </ol>
    </div>
  </section>'''


# ------------------------------------------------------------------ B · The reel
def hub_reel(base=''):
    wall, lazy, cur = '', ' loading="lazy"', ' aria-current="true"'
    for row in range(3):
        tiles = ''.join(f'<img src="{frame(base, s, (s["key"] - 1 + row) % s["n"] + 1, "thumb")}" alt="" width="800" height="500" decoding="async"{lazy if row == 2 else ""}>'
                        for s in (STORIES if row != 1 else STORIES[::-1]))
        wall += f'<div class="rl-row">{tiles}{tiles}</div>'
    stage, steps, index = '', '', ''
    for i, s in enumerate(STORIES):
        pics = ''
        for k in range(1, s['n'] + 1):
            first = i == 0 and k == 1
            src = 'src' if first else 'data-src'
            srcset = 'srcset' if first else 'data-srcset'
            pics += (f'<picture class="rl-f{" is-on" if k == 1 else ""}"><source media="(max-width:760px)" {srcset}="{frame(base, s, k, "tall")}">'
                     f'<img {src}="{frame(base, s, k)}" alt="" width="1600" height="1000" decoding="async"></picture>')
        stage += f'<div class="rl-story{" is-on" if i == 0 else ""}" data-i="{i}">{pics}</div>'
        index += f'<li><a href="#s-{s["slug"]}"{cur if i == 0 else ""}><span>{i + 1:02d}</span>{s["name"]}</a></li>'
        steps += f'''
      <article class="rl-step" id="s-{s["slug"]}" data-i="{i}">
        <div class="rl-pin"><div class="rl-card">
          <p class="rl-n" aria-hidden="true">{i + 1:02d}</p>
          <p class="rl-kick">{kick(s)}</p>
          <h2>{s["t"]}</h2>
          <p class="rl-dek">{s["dek"]}</p>
          <p class="rl-meta">About {s["mins"]} minutes<span class="hb-sep">&#183;</span>Follow {s["follow"]}</p>
          {read(base, s, "hb-go")}
        </div></div>
      </article>'''
    bars = ''.join('<li><i></i></li>' for _ in STORIES)
    return f'''
<main id="st" class="hb hb-reel">
  <section class="rl-open" aria-labelledby="rl-h">
    <div class="rl-wall" aria-hidden="true">{wall}</div>
    <div class="rl-open-in">
      <p class="st-kicker">Not For Sale &#183; Stories</p>
      <h1 id="rl-h">Stories that move <em>as you scroll</em></h1>
      <p class="rl-lead">{LEAD}</p>
      <p class="rl-facts"><span><b>6</b> stories</span><span><b>{MINUTES}</b> minutes of reading</span><span><b>17</b> building blocks</span></p>
    </div>
    <a class="rl-cue" href="#s-the-offer"><span>Scroll the trailer</span><i aria-hidden="true"></i></a>
  </section>

  <section class="rl-reel" aria-label="The six stories">
    <div class="rl-stage">
      <div class="rl-pics" aria-hidden="true">{stage}</div>
      <div class="rl-scrim" aria-hidden="true"></div>
      <ol class="rl-bars" aria-hidden="true">{bars}</ol>
      <nav class="rl-index" aria-label="Jump to a story"><ol>{index}</ol></nav>
    </div>
    <div class="rl-steps">{steps}
    </div>
  </section>
  {blocks(base)}
</main>
{switcher(base, "b")}
'''


# ------------------------------------------------------------------ A · Front page
def fp_item(base, s, i, size, cls):
    return f'''
      <a class="fp-item {cls} rv" style="--d:{i % 3}" href="{base}{s["slug"]}/">
        {poster(base, s, size)}
        <p class="fp-kick"><span class="fp-num">{STORIES.index(s) + 1:02d}</span>{kick(s)}</p>
        <h3>{s["t"]}</h3>
        <p class="fp-dek">{s["dek"]}</p>
        <p class="fp-meta">About {s["mins"]} minutes<span class="hb-sep">&#183;</span>Follow {s["follow"]}</p>
        <span class="hb-more">Read the story<span class="st-sr">: {s["name"]}</span> {ARROW}</span>
      </a>'''


def hub_front(base='../../'):
    lead, two, three = STORIES[0], STORIES[1:3], STORIES[3:]
    return f'''
<main id="st" class="hb hb-front">
  <div class="fp-wrap">
    <div class="fp-mast">
      <p class="fp-line"><span>Not For Sale</span><span class="fp-mid">Visual stories &#183; Concept mockups for review</span><span>October 2026</span></p>
      <h1 class="fp-title">Stories that move <em>as you scroll</em></h1>
      <p class="fp-line fp-line-b"><span>{LEAD}</span><span class="fp-facts"><b>6</b> stories &#183; <b>{MINUTES}</b> minutes &#183; <b>17</b> blocks</span></p>
    </div>

    <article class="fp-lead rv">
      <a class="fp-lead-pic" href="{base}{lead["slug"]}/" tabindex="-1" aria-hidden="true">{poster(base, lead, "wide", auto=True, eager=True)}<span class="fp-play"><i></i><span class="on-hover">Hover to scrub through the story</span><span class="on-touch">Frames from the story</span></span></a>
      <div class="fp-lead-text">
        <p class="fp-kick"><span class="fp-num">01</span>{kick(lead)}</p>
        <h2><a href="{base}{lead["slug"]}/">{lead["t"]}</a></h2>
        <p class="fp-dek">{lead["dek"]}</p>
        <p class="fp-meta">About {lead["mins"]} minutes<span class="hb-sep">&#183;</span>Follow {lead["follow"]}</p>
        {read(base, lead, "hb-go")}
      </div>
    </article>

    <div class="fp-row fp-two">{"".join(fp_item(base, s, i, "wide", "") for i, s in enumerate(two))}
    </div>
    <div class="fp-row fp-three">{"".join(fp_item(base, s, i, "thumb", "is-small") for i, s in enumerate(three))}
    </div>
  </div>
  {blocks(base, dark=True)}
</main>
{switcher(base, "a")}
'''


# ------------------------------------------------------------------ C · Contents
def hub_contents(base='../../'):
    rows = ''
    for i, s in enumerate(STORIES):
        cause = kick(s).split('<span class="hb-sep">')[0]
        rows += f'''
      <li class="tc-row rv" style="--d:{i}">
        <a href="{base}{s["slug"]}/" data-src="{base}assets/img/posters/{s["slug"]}-{{n}}-thumb.webp" data-n="{s["n"]}" data-key="{s["key"]}" data-c="{s["c"]}">
          <span class="tc-thumb">{poster(base, s, "thumb")}</span>
          <span class="tc-n">{i + 1:02d}</span>
          <span class="tc-title">{s["t"]}</span>
          <span class="tc-meta"><span class="tc-cause">{cause}</span><span>{s["place"]}</span><span>About {s["mins"]} minutes</span></span>
          <span class="tc-more"><span><span class="tc-dek">{s["dek"]}</span></span></span>
          <span class="tc-go" aria-hidden="true">{ARROW}</span>
        </a>
      </li>'''
    return f'''
<main id="st" class="hb hb-toc">
  <div class="tc-wrap">
    <div class="tc-head">
      <div>
        <p class="st-kicker">Not For Sale &#183; Stories</p>
        <h1>Six stories that move <em>as you scroll</em></h1>
      </div>
      <div class="tc-aside">
        <p>{LEAD}</p>
        <p class="tc-facts"><span><b>{MINUTES}</b> minutes of reading</span><span><b>17</b> building blocks</span></p>
      </div>
    </div>
    <p class="tc-label"><span>Contents</span><span class="tc-hint">Point at a story to see it move</span></p>
    <ol class="tc-list">{rows}
    </ol>
  </div>
  <div class="tc-float" aria-hidden="true"><img alt="" width="800" height="500"><span class="lp-ticks"></span></div>
  {blocks(base)}
</main>
{switcher(base, "c")}
'''
