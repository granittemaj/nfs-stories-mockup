#!/usr/bin/env python3
"""Builds the static mockup: the stories hub (index.html) and each story page.

    python3 src/build.py

Story pages are src/<slug>.html with <!--scene:name--> markers, filled from src/scenes/<name>.svg.
Both pages get the site shell: the papingu theme's styles.css and app.js (header, footer,
newsletter, search), with content-hashed asset URLs so GitHub Pages never serves stale CSS/JS."""
import hashlib, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
FADE = open(os.path.join(HERE, 'fade-head.js')).read().strip()


def ver(rel):
    return hashlib.md5(open(os.path.join(OUT, rel), 'rb').read()).hexdigest()[:8]


def scene(name):
    path = os.path.join(HERE, 'scenes', name + '.svg')
    s = open(path).read().strip() if os.path.exists(path) else ''
    if name == 'map':
        # the minibus that rides the route
        bus = ('<g class="m-bus"><circle class="m-bus-halo" r="20"/>'
               '<rect class="m-bus-body" x="-13" y="-7" width="26" height="14" rx="4"/>'
               '<rect class="m-bus-win" x="4" y="-4.5" width="6" height="9" rx="1.5"/></g>')
        s = s.replace('</svg>', bus + '\n</svg>')
    if name == 'coast2':
        # the same coast a second time (replanted), with its own anchor for the boat
        s = open(os.path.join(HERE, 'scenes', 'coast.svg')).read().strip().replace('id="cs-boat-spot"', 'id="cs-boat-spot2"')
    if name == 'europe':
        # The Offer's night map of Europe as a still picture (no route, no stops), written out as
        # an image file so the page does not carry it inline
        m = open(os.path.join(HERE, 'scenes', 'map.svg')).read().strip()
        m = re.sub(r'<path class="m-route[^"]*"[^>]*/>', '', m)
        m = m[:m.find('<g class="m-stops">')] + m[m.rfind('</svg>'):]
        css = ('<style>.m-sea{fill:#091013}.m-land{fill:#221e1a}.m-borders{fill:none;stroke:#4a423a;stroke-width:1.2}'
               '.m-lights path{fill:none;stroke:#ffc27a;stroke-linecap:round}.m-l0{opacity:.32}.m-l1{opacity:.55}.m-l2{opacity:.85}</style>')
        m = m.replace('<svg class="st-map"', '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100"', 1)
        m = m.replace('<defs>', '<defs>' + css, 1)
        open(os.path.join(OUT, 'assets', 'img', 'europe-night.svg'), 'w').write(m)
        s = '<img class="st-art e-map" src="../assets/img/europe-night.svg" alt="" width="1600" height="1100" loading="lazy" decoding="async">'
    return s


def page(path, title, desc, body, extra_js=True, kind='story'):
    p = '../' * path.count('/')
    css = ['assets/css/chrome.css', 'assets/fonts/fonts.css', 'assets/css/styles.css', 'assets/css/story.css']
    js = ['assets/js/config.js', 'assets/js/app.js'] + (['assets/js/story.js'] if extra_js else [])
    links = '\n'.join(f'<link rel="stylesheet" href="{p}{c}?v={ver(c)}">' for c in css)
    scripts = '\n'.join(f'<script src="{p}{j}?v={ver(j)}" defer></script>' for j in js)
    doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0e0c0b">
<link rel="icon" href="{p}assets/img/favicon.png">
<link rel="preload" href="{p}assets/fonts/playfair-display-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>{FADE}</script>
{links}
{scripts}
</head>
<body data-page="{kind}">
<div class="wp-site-blocks">
<header class="wp-block-template-part"><a class="skip-link" href="#st">Skip to content</a><div id="bar"></div><div id="site-header"></div></header>
{body}
<footer class="wp-block-template-part"><div id="site-newsletter"></div><div id="site-footer"></div></footer>
</div>
<p class="st-mockflag" role="note">Mockup for review<span>. Not the live site.</span></p>
</body>
</html>
'''
    fp = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(fp) or OUT, exist_ok=True)
    open(fp, 'w').write(doc)
    print('built', path, f'{len(doc) // 1024}KB')


def story(slug, title, desc):
    src = open(os.path.join(HERE, slug + '.html')).read()
    body = re.sub(r'<!--scene:([a-z0-9]+)-->', lambda m: scene(m.group(1)), src)
    page(f'{slug}/index.html', title, desc, body)


HUB = '''
<main id="st" class="st-hub">
  <section class="hub-hero">
    <div class="hub-wrap">
      <p class="st-kicker">Not For Sale &#183; Stories</p>
      <h1>Stories that move <em>as you scroll</em></h1>
      <p class="hub-lead">Visual stories in the spirit of the best newsroom graphics desks. Each one follows a single thread (a phone, a plane, a bowl of soup) through the places our work happens.</p>
      <p class="hub-note">Concept mockups for review. Not published.</p>
    </div>
  </section>

  <section class="hub-wrap">
    <a class="hub-feature" href="the-offer/">
      <div class="hub-feature-art" aria-hidden="true">
        <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice">
          <defs><radialGradient id="hubGlow" cx="62%" cy="48%" r="50%"><stop offset="0" stop-color="#F5821F" stop-opacity=".28"/><stop offset="1" stop-color="#F5821F" stop-opacity="0"/></radialGradient></defs>
          <rect width="600" height="420" fill="#0e0c0b"/><rect width="600" height="420" fill="url(#hubGlow)"/>
          <path d="M40 330C140 300 200 330 270 290S400 250 470 180 560 110 590 90" fill="none" stroke="#F5821F" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" opacity=".55"/>
          <circle cx="40" cy="330" r="6" fill="#F5821F"/><circle cx="590" cy="90" r="6" fill="#fff"/>
        </svg>
        <div class="hub-phone"><div><p class="t">23:47</p><div class="n"><b>Mihai</b><span>Ana! My cousin&#8217;s restaurant in Amsterdam needs kitchen staff.</span></div></div></div>
      </div>
      <div class="hub-feature-text">
        <p class="hub-num">01 &#183; Ready to review</p>
        <p class="st-kicker">Human trafficking &#183; Netherlands</p>
        <h2>The <em>Offer</em></h2>
        <p>A job abroad, a minibus, a kitchen with a locked door, and the way out. Follow Ana&#8217;s phone from her mother&#8217;s kitchen table to a restaurant in Amsterdam, and on to Dignita.</p>
        <span class="hub-go">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </div>
    </a>

    <div class="hub-next">
      <a class="hub-card" href="the-forest-line/">
        <div class="hub-card-art is-green" aria-hidden="true">
          <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#d7c49e"/><g fill="#7fb2a4"><ellipse cx="70" cy="40" rx="40" ry="22"/><ellipse cx="300" cy="30" rx="50" ry="20"/><ellipse cx="190" cy="70" rx="30" ry="16"/></g><g fill="#3f7fc6"><rect x="120" y="30" width="14" height="10"/><rect x="138" y="36" width="12" height="9"/></g><path d="M0 104q60-14 120 0t140 -6 140 6V220H0Z" fill="#1d361b"/><path d="M0 104q60-14 120 0t140 -6 140 6" fill="none" stroke="#F5821F" stroke-width="3" stroke-dasharray="9 7"/><g fill="#3b6b31"><circle cx="40" cy="150" r="22"/><circle cx="100" cy="170" r="24"/><circle cx="170" cy="140" r="20"/><circle cx="240" cy="180" r="26"/><circle cx="320" cy="150" r="24"/><circle cx="380" cy="190" r="22"/></g><g fill="#9dbb66"><circle cx="210" cy="150" r="20"/><circle cx="350" cy="196" r="18"/></g><g transform="translate(250 66) rotate(180) scale(.42)"><rect x="8" y="74" width="184" height="30" rx="10" fill="#f6f1e7"/><rect x="8" y="74" width="24" height="30" rx="10" fill="#F5821F"/><rect x="168" y="74" width="24" height="30" rx="10" fill="#F5821F"/><path d="M100 188c13-3 15-30 14-62l-4-84q-1-14-10-16q-9 2-10 16l-4 84c-1 32 1 59 14 62Z" fill="#fbf8f2"/><path d="M60 28h80q6 0 6 6v6q0 6-6 6H60q-6 0-6-6v-6q0-6 6-6Z" fill="#f6f1e7"/></g></svg>
        </div>
        <p class="hub-num">02 &#183; Ready to review</p>
        <h3>The Forest Line</h3>
        <p>A low flight over Madre de Dios, Peru, from the gold-mining pits to the forest communities keep standing, with a zone bar like the Kill Zone fly-over. Then one Brazil nut tree, and the loop that pays for the forest.</p>
        <span class="hub-more">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
      <a class="hub-card" href="a-bowl-of-soup/">
        <div class="hub-card-art is-rust" aria-hidden="true">
          <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#3b2a1e"/><path d="M0 0h400v220H0Z" fill="url(#hubWood)" opacity=".5"/><defs><pattern id="hubWood" width="40" height="220" patternUnits="userSpaceOnUse"><rect width="22" height="220" fill="#35261b"/></pattern></defs><circle cx="200" cy="112" r="78" fill="#f6f1e7"/><circle cx="200" cy="112" r="78" fill="none" stroke="#F5821F" stroke-width="5"/><circle cx="200" cy="112" r="60" fill="#e2772f"/><path d="M172 104q18-18 38-4t30 2" stroke="#fbf3e4" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M226 140l46 40" stroke="#efe8dc" stroke-width="9" stroke-linecap="round"/><path d="M180 30q-8-14 0-26M200 26q-8-14 0-26M220 30q-8-14 0-26" stroke="#f3ede3" stroke-opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
        </div>
        <p class="hub-num">03 &#183; Ready to review</p>
        <h3>A Bowl of Soup</h3>
        <p>How a soup program in an Amsterdam safe house became Dignita: a year that counts across a real map of Amsterdam, a recipe card, 4,561 squares for 4,561 people, and a wipe from 2012 to today.</p>
        <span class="hub-more">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
      <a class="hub-card" href="slavery-changes-shape/">
        <div class="hub-card-art" aria-hidden="true">
          <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#0e0c0b"/><path d="M200 0C200 40 150 50 150 80s50 40 50 70-40 40-40 70" fill="none" stroke="#F5821F" stroke-width="4" stroke-linecap="round"/><circle cx="160" cy="220" r="0"/><circle cx="150" cy="80" r="8" fill="#F5821F"/><circle cx="200" cy="150" r="8" fill="#F5821F"/><g fill="#3a342e"><rect x="250" y="40" width="110" height="20" rx="2"/><rect x="256" y="62" width="104" height="20" rx="2"/><rect x="246" y="84" width="114" height="20" rx="2"/></g><g fill="#C46F49"><rect x="40" y="120" width="12" height="12"/><rect x="56" y="120" width="12" height="12"/><rect x="72" y="120" width="12" height="12"/><rect x="88" y="120" width="12" height="12"/></g><g fill="#4F8E92"><rect x="40" y="136" width="12" height="12"/><rect x="56" y="136" width="12" height="12"/><rect x="72" y="136" width="12" height="12"/></g></svg>
        </div>
        <p class="hub-num">04 &#183; Ready to review</p>
        <h3>Slavery Changes Shape</h3>
        <p>Mark Wexler&#8217;s history of modern-day slavery as a scroll: a thread through the ancient world, the Atlantic trade on a map, a century of laws piling up, and the new shapes slavery takes today.</p>
        <span class="hub-more">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
      <a class="hub-card" href="upstream/">
        <div class="hub-card-art" aria-hidden="true">
          <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="hubUp" x1="0" x2="1"><stop offset="0" stop-color="#28323b"/><stop offset="1" stop-color="#f6e3bd"/></linearGradient></defs><rect width="400" height="220" fill="url(#hubUp)"/><path d="M240 140l60-80 40 40 60-60v100Z" fill="#8a9f7a"/><rect y="140" width="400" height="80" fill="#4F8E92"/><g stroke="#fff" stroke-opacity=".3" stroke-width="3"><path d="M20 170h50M140 190h60M280 165h50"/></g><g transform="translate(180 150)"><path d="M-30 0h60l-12 14h-36Z" fill="#fbf8f2"/><path d="M-30 0l30-30v30Z" fill="#efe6d6"/><path d="M0 -30l18 30H0Z" fill="#fbf8f2"/><path d="M-18 7h36" stroke="#F5821F" stroke-width="3"/></g></svg>
        </div>
        <p class="hub-num">05 &#183; Ready to review</p>
        <h3>Upstream</h3>
        <p>The social innovation glossary as one river that pans sideways as you scroll: rescue downstream, root causes on the banks, upstream intervention at the source. Then eight words, one page at a time.</p>
        <span class="hub-more">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
      <a class="hub-card" href="when-the-land-breaks/">
        <div class="hub-card-art" aria-hidden="true">
          <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#1a130e"/><path d="M0 170h400" stroke="#4a423a" stroke-width="3"/><rect x="60" y="80" width="26" height="90" rx="3" fill="#7fa856" transform="rotate(40 86 170)"/><rect x="120" y="80" width="26" height="90" rx="3" fill="#f3ede3" transform="rotate(40 146 170)"/><rect x="180" y="80" width="26" height="90" rx="3" fill="#f3ede3" transform="rotate(40 206 170)"/><rect x="240" y="80" width="26" height="90" rx="3" fill="#f3ede3"/><rect x="300" y="80" width="26" height="90" rx="3" fill="#C46F49"/></svg>
        </div>
        <p class="hub-num">06 &#183; Two versions to choose from</p>
        <h3>When the Land Breaks</h3>
        <p>The ecocide article, two ways: one mangrove coast changing over time, or forty years of the Amazon in real satellite images.</p>
        <span class="hub-more">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
    </div>
  </section>

  <section class="hub-wrap hub-blocks">
    <p class="st-kicker">What the stories are built from</p>
    <h2>Eighteen building blocks, ready to become WordPress blocks</h2>
    <ol>
      <li><b>The guide</b><span>One object that travels the whole story and lands on things: Ana&#8217;s phone, the plane over Madre de Dios.</span></li>
      <li><b>Sticky scenes</b><span>An illustration holds still while the text scrolls over it, and the camera moves to what each line is about.</span></li>
      <li><b>The route map</b><span>A route that draws itself as you scroll, with a distance bar and stops that light up.</span></li>
      <li><b>The fly-over</b><span>One long picture scrolls under the guide, with a zone bar, like the Reuters Kill Zone flight.</span></li>
      <li><b>Close-up circles</b><span>Zoomed-in details that pop out of the landscape as you pass them.</span></li>
      <li><b>The cut-away</b><span>A building or a tree opened up, with rings that point at what matters.</span></li>
      <li><b>Counters</b><span>Numbers that add up as you read: in The Offer, a debt that can never be paid off.</span></li>
      <li><b>Spot the signs</b><span>Numbered markers on a scene, one sign per step, so readers learn what to look for.</span></li>
      <li><b>The loop</b><span>A diagram a dot travels around, step by step: from forest to bottle and back.</span></li>
      <li><b>The year counter</b><span>A date that counts up as the story moves through time, over a real map.</span></li>
      <li><b>One square, one person</b><span>A unit chart that colors itself in, group by group, as you read.</span></li>
      <li><b>Then and now</b><span>Two pictures of the same place; scrolling wipes from one year to the other.</span></li>
      <li><b>The thread</b><span>A line that draws itself down the page, linking the eras of a long history.</span></li>
      <li><b>The paper trail</b><span>Things that pile up as you read: here, a century of laws and treaties.</span></li>
      <li><b>The panorama</b><span>One wide picture that pans sideways as you scroll down: a river walked upstream.</span></li>
      <li><b>The glossary</b><span>A dictionary page that turns with each card, one word at a time.</span></li>
      <li><b>The time-lapse</b><span>One illustrated place that changes state with each card: the coast, the ponds, the storm.</span></li>
      <li><b>The satellite wipe</b><span>Real satellite images of one place, years apart, wiping into each other as you scroll.</span></li>
    </ol>
  </section>
</main>
'''

COAST_ART = ('<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#e9d9b4"/>'
             '<rect y="140" width="400" height="80" fill="#2a5b5e"/><g fill="#3f6a38"><circle cx="230" cy="110" r="30"/><circle cx="290" cy="104" r="34"/><circle cx="350" cy="112" r="30"/></g>'
             '<g stroke="#4a3527" stroke-width="3" fill="none"><path d="M230 130q-10 20-16 50M290 130q10 20 14 50M350 130q-8 20-12 50"/></g>'
             '<g transform="translate(40 96)"><rect width="70" height="44" fill="#c9a066"/><path d="M-8 0h86L35-26Z" fill="#C46F49"/></g>'
             '<path d="M120 136q50 12 100-4l-8 10q-42 10-86 2Z" fill="#6b4a33"/></svg>')
SPACE_ART = ('<img src="../assets/img/space/madre-de-dios-full_2025.webp" alt="" style="width:100%;height:100%;object-fit:cover;display:block">')

CHOOSER = f'''
<main id="st" class="st-hub">
  <div class="ch-wrap">
    <p class="st-kicker">Story 06 &#183; Two versions</p>
    <h1>When the Land <em>Breaks</em></h1>
    <p class="ch-lead">The first version explained ecocide with diagrams. These two show it instead: one in an illustrated place, one with real satellite images. Pick the one to keep.</p>
    <div class="ch-grid">
      <a class="hub-card" href="../when-the-land-breaks-coast/">
        <div class="hub-card-art" aria-hidden="true">{COAST_ART}</div>
        <p class="hub-num">Version A</p>
        <h3>One coast, over time</h3>
        <p>A mangrove fishing village that changes as you scroll: the ponds, the storm, the empty sea, the road out, and the fishing boats where some end up. Then the coast replanted.</p>
        <span class="hub-more">See version A</span>
      </a>
      <a class="hub-card" href="../when-the-land-breaks-from-space/">
        <div class="hub-card-art" aria-hidden="true">{SPACE_ART}</div>
        <p class="hub-num">Version B</p>
        <h3>From space</h3>
        <p>Real NASA satellite images of one corner of Madre de Dios, Peru: 1985, 2000 and 2025, wiping into each other as you scroll, then up close, then what a satellite cannot see.</p>
        <span class="hub-more">See version B</span>
      </a>
    </div>
    <p style="margin-top:28px"><a class="st-link" href="../">All story mockups</a></p>
  </div>
</main>
'''

if __name__ == '__main__':
    story('the-offer', 'The Offer &#183; Not For Sale stories (mockup)',
          'How a job offer becomes a trap, and how the way out begins. A scroll-driven story mockup for Not For Sale.')
    story('upstream', 'Upstream &#183; Not For Sale stories (mockup)',
          'Social innovation in one river: why Not For Sale works on the causes of trafficking, not only on rescue. A scroll-driven story mockup.')
    story('when-the-land-breaks-coast', 'When the Land Breaks: one coast &#183; Not For Sale stories (mockup)',
          'One mangrove coast, over time: how ecocide pushes people toward traffickers. Version A of a scroll-driven story mockup.')
    story('when-the-land-breaks-from-space', 'When the Land Breaks: from space &#183; Not For Sale stories (mockup)',
          'Forty years of one corner of the Amazon, seen from space: gold mining in Madre de Dios. Version B of a scroll-driven story mockup.')
    page('when-the-land-breaks/index.html', 'When the Land Breaks: two versions &#183; Not For Sale stories (mockup)',
         'Two versions of story 06 to choose from.', CHOOSER, extra_js=False, kind='stories')
    story('slavery-changes-shape', 'Slavery Changes Shape &#183; Not For Sale stories (mockup)',
          'From the first civilizations to the scam compounds of today: the history of slavery and the fight against it. A scroll-driven story mockup for Not For Sale.')
    story('a-bowl-of-soup', 'A Bowl of Soup &#183; Not For Sale stories (mockup)',
          'How a soup program in an Amsterdam safe house grew into Dignita. A scroll-driven story mockup for Not For Sale.')
    story('the-forest-line', 'The Forest Line &#183; Not For Sale stories (mockup)',
          'A flight over Madre de Dios, Peru, from the gold mines to the forest people keep standing. A scroll-driven story mockup for Not For Sale.')
    page('index.html', 'Not For Sale stories (mockup)',
         'Concept mockups for scroll-driven visual stories on wearenotforsale.org.', HUB, extra_js=False, kind='stories')
