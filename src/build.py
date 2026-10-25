#!/usr/bin/env python3
"""Builds the static mockup: the stories hub (index.html, from src/hub.html) and each story page.

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


def page(path, title, desc, body, kind='story'):
    p = '../' * path.count('/')
    hub = kind == 'stories'
    css = ['assets/css/chrome.css', 'assets/fonts/fonts.css', 'assets/css/styles.css', 'assets/css/story.css'] + (['assets/css/hub.css'] if hub else [])
    js = ['assets/js/config.js', 'assets/js/app.js', 'assets/js/hub.js' if hub else 'assets/js/story.js']
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
{'' if hub else '<p class="st-mockflag" role="note">Mockup for review<span>. Not the live site.</span></p>'}
</body>
</html>
'''
    fp = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(fp) or OUT, exist_ok=True)
    open(fp, 'w').write(doc)
    print('built', path, f'{len(doc) // 1024}KB')


def redirect(path, to):
    fp = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, 'w').write(f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">'
                        f'<meta http-equiv="refresh" content="0;url={to}"><link rel="canonical" href="{to}">'
                        f'<title>Moved</title><a href="{to}">This story has moved.</a>\n')
    print('redirect', path, '->', to)


def story(slug, title, desc):
    src = open(os.path.join(HERE, slug + '.html')).read()
    body = re.sub(r'<!--scene:([a-z0-9]+)-->', lambda m: scene(m.group(1)), src)
    page(f'{slug}/index.html', title, desc, body)


if __name__ == '__main__':
    story('the-offer', 'The Offer &#183; Not For Sale stories (mockup)',
          'How a job offer becomes a trap, and how the way out begins. A scroll-driven story mockup for Not For Sale.')
    story('upstream', 'Upstream &#183; Not For Sale stories (mockup)',
          'Social innovation in one river: why Not For Sale works on the causes of trafficking, not only on rescue. A scroll-driven story mockup.')
    story('when-the-land-breaks', 'When the Land Breaks &#183; Not For Sale stories (mockup)',
          'One mangrove coast, over time: how ecocide pushes people toward traffickers, and how to stop it upstream. A scroll-driven story mockup.')
    # the two retired versions of story 06 point to the one that was kept
    redirect('when-the-land-breaks-coast/index.html', '../when-the-land-breaks/')
    redirect('when-the-land-breaks-from-space/index.html', '../when-the-land-breaks/')
    story('slavery-changes-shape', 'Slavery Changes Shape &#183; Not For Sale stories (mockup)',
          'From the first civilizations to the scam compounds of today: the history of slavery and the fight against it. A scroll-driven story mockup for Not For Sale.')
    story('a-bowl-of-soup', 'A Bowl of Soup &#183; Not For Sale stories (mockup)',
          'How a soup program in an Amsterdam safe house grew into Dignita. A scroll-driven story mockup for Not For Sale.')
    story('the-forest-line', 'The Forest Line &#183; Not For Sale stories (mockup)',
          'A flight over Madre de Dios, Peru, from the gold mines to the forest people keep standing. A scroll-driven story mockup for Not For Sale.')
    page('index.html', 'Stories | Not For Sale', 'Visual stories from Not For Sale: each one follows one thing through the places '
         'where our work happens, to show how exploitation begins and how we stop it.',
         open(os.path.join(HERE, 'hub.html')).read(), kind='stories')
