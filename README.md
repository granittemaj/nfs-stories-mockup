# Not For Sale stories · mockup

Concept mockups for scroll-driven visual stories on [wearenotforsale.org](https://wearenotforsale.org),
inspired by Reuters Graphics, in particular
[Inside Ukraine's Kill Zone](https://www.reuters.com/graphics/UKRAINE-CRISIS/KILL-ZONE/znpnojmknvl/)
(the drone that comes down as you scroll and carries the story).

**Not the live site.** Pages are `noindex`. Built in the site's own design system: the papingu
theme's `styles.css`, `app.js` (header, footer, newsletter, search) and fonts.

- Stories hub: [`index.html`](index.html)
- Story 01, The Offer: [`the-offer/`](the-offer/)
- Story 02, The Forest Line: [`the-forest-line/`](the-forest-line/)
- Story 03, A Bowl of Soup: [`a-bowl-of-soup/`](a-bowl-of-soup/)
- Story 04, Slavery Changes Shape: [`slavery-changes-shape/`](slavery-changes-shape/)
- Story 05, Upstream: [`upstream/`](upstream/)
- Story 06, When the Land Breaks, two versions: [`when-the-land-breaks/`](when-the-land-breaks/)

## 01 · The Offer

A composite story about labour trafficking, told through Ana's phone. The phone is the "drone":
it travels down through every scene and lands on things.

| Chapter | What happens on screen |
| --- | --- |
| The offer | A phone lights up in the dark. A notification, then a chat, then the title. |
| Home | The phone drops onto a kitchen table. The camera visits the window (the closed factory), the bills, the phone. |
| The journey | A night map of Europe (Natural Earth shapes, 1:50m). The route draws itself as you scroll, a minibus rides it, stops light up, a distance bar counts to about 2,100 km. The phone docks to the side and shows the chat with her mother. |
| The kitchen | A canal house cut open, floor by floor. The camera zooms to the kitchen, the locked room, the manager. The phone flies into his hand. A ledger adds up a debt that can never be paid off. |
| Would you notice? | The same restaurant from the street. Five numbered signs, one per step. |
| The way out | A door opens as you scroll and the light floods in. |
| Dignita | Daylight. Not For Sale's restaurant in Amsterdam and the Dignita Academy. The phone rises again: a real job offer, with a contract. |
| After | The article: a composite note, four figures, the Donate band, sources. |

## 02 · The Forest Line

A flight over Madre de Dios, Peru. A small plane is the guide: it flies down the page over one
long illustrated landscape (`assets/img/forest-flyover.svg`, drawn by `tools/forest`), with a
sticky zone bar like the Kill Zone fly-over. Facts come from Not For Sale's
[Peru page](https://wearenotforsale.org/projects/peru/).

| Chapter | What happens on screen |
| --- | --- |
| Above the Amazon | Canopy at dawn, from above. The plane flies in, then the title. |
| The fly-over | Pasture, then the mining zone: pits, blue-tarp camps, dredges, close-up circles that pop out (mining pit, camp, dredge and mercury). The forest line lights up in orange. Then standing forest: Brazil nut trees, a harvest boat, an AFIMAD community, the Camino Verde seed bank. |
| One tree | We land. One Brazil nut tree from crown to roots: the bees, a falling pod, the agouti that plants the next tree. |
| The loop | A nut travels a circle: forest, harvest, river, exporter, REBBL, 2.5% back to Not For Sale. |
| How much forest | 753 square miles next to New York City, drawn to scale. |
| After | The article: ecocide and slavery as one system, four figures, Donate, sources. |

## 03 · A Bowl of Soup

How Home Soup, a soup programme in an Amsterdam safe house (2012), grew into Dignita. A bowl of
soup is the guide: it lands on a kitchen counter, then travels a real map of Amsterdam
(OpenStreetMap water and parks, built by `tools/amsterdam`). Facts come from Not For Sale's
[Dignita](https://wearenotforsale.org/partners/dignita/) and
[Netherlands](https://wearenotforsale.org/projects/netherlands/) pages.

| Chapter | What happens on screen |
| --- | --- |
| A pot of soup | A bowl steams on a wooden table, then the title. |
| Home Soup | The safe-house kitchen in 2012: the window, the pot, the jars and the certificate. |
| Across Amsterdam | A year counts up (2012, 2015, 2017, 2020, Today) while the bowl moves from pin to pin: the Red Light District, Vondelpark, Hoftuin, Westerpark. Closed sites fade. |
| The recipe | Dignita's kitchen with a recipe card that ticks itself off: real restaurant, accredited training, four tracks, real work, profits back in. |
| 4,561 people | One square per person, coloured in by group: served directly, outreach, Academy graduates. |
| Then and now | Scrolling wipes from the 2012 kitchen to the restaurant today. |
| What's next | The night map of Europe: the recipe may travel back east. Links to The Offer. |

## 04 · Slavery Changes Shape

Mark Wexler's article [The History of Modern-Day Slavery and Human
Trafficking](https://wearenotforsale.org/human-trafficking/history-of-modern-day-slavery/) as a
scroll. No guide object this time: an orange thread draws itself down the page instead.

| Chapter | What happens on screen |
| --- | --- |
| Older than history | A line starts down a dark page, then the title. |
| Before 1500 | The thread swings through six eras (the ancient world, the Islamic world, Africa, Asia, the Americas, medieval Europe), each with an illustration. |
| 1500 to 1866 | A map of the Atlantic: the routes of the slave trade draw in by region, a year card goes from 1500 to 1807 to 1866. |
| After the trade | The thread again: Wilberforce, then Chinese immigrants trafficked into the United States in the 1800s. |
| A century of laws | Laws and treaties drop onto a pile, 1904 to 2024, while the year counts. |
| Today | 500 squares, one per 100,000 people: 28 million in forced labour, 22 million in forced marriage. |
| New shapes | Online recruitment (linking to The Offer), scam compounds, climate change (linking to The Forest Line). |

## 05 · Upstream

Not For Sale's [Social Innovation Terms and
Definitions](https://wearenotforsale.org/social-innovation/social-innovation-terms-definitions/)
as one river. A paper boat is the guide; it stays on the water while a 6000-wide panorama
(`tools/river`) pans sideways as you scroll, so the boat travels upstream: rescue downstream, the
root causes on the banks, upstream intervention, systems change at the source. Then eight terms
from the glossary, one dictionary page at a time, and three cards linking to Dignita, The Forest
Line and the Peru project.

## 06 · When the Land Breaks (two versions)

Not For Sale's [Ecocide Meaning: How It Fuels Human
Trafficking](https://wearenotforsale.org/human-trafficking/ecocide-meaning-how-it-fuels-human-trafficking/).
The first version (diagrams: a highlighted definition, dominoes, a world map) was rejected and
removed. Two replacements are up for a choice at [`when-the-land-breaks/`](when-the-land-breaks/):

- **A · One coast, over time** ([`when-the-land-breaks-coast/`](when-the-land-breaks-coast/)):
  one illustrated mangrove fishing village (`src/scenes/coast.svg`) that changes state with each
  card: the coast, the shrimp ponds, the storm, the empty sea, the road out. Then the fishing
  boats where some end up (`sea.svg`), and the same coast replanted. A small fishing boat is the
  guide.
- **B · From space** ([`when-the-land-breaks-from-space/`](when-the-land-breaks-from-space/)):
  real satellite images of one 54 by 33 km frame of Madre de Dios, Peru (13.15° to 12.85° S,
  70.35° to 69.85° W), from NASA GIBS: Landsat annual composites for 1985 and 2000, and
  Harmonized Landsat and Sentinel-2 for 16 August 2025, which wipes in as you scroll. Then a
  close-up of the mining zone, and what a satellite cannot see. River and highway labels are
  placed from OpenStreetMap; the outline of the mining area is drawn by hand. Images are in
  `assets/img/space/` (WebP, about 1.1 MB in all).

## The building blocks

Everything is driven by data attributes on the text steps, so each block can become a WordPress
block later. The engine is `assets/js/story.js` (vanilla, no dependencies, about 330 lines).

| Attribute | What it does |
| --- | --- |
| `data-g="x:50;y:40;s:1;r:0;rx:0;o:1;screen:lock;msgs:0"` | Where the phone is when this step is centred (x, y in % of the stage), its scale, tilt, opacity, screen and how many chat messages show. Leftover values carry over from the step before. |
| `data-g="a:#id"` | The phone follows an element in the scene (it lands on the table, goes into the manager's hand). |
| `data-gm="..."` | The same for phones and narrow screens. |
| `data-cam="x y s"` / `data-camm` | Move the scene's camera to x, y (SVG units) at scale s. |
| `data-ring="n"` | Pulse the highlight ring `n` in the scene. |
| `data-stop="vienna"` | The map: the minibus reaches this stop when the step is centred. |
| `data-ledger="n"` | The kitchen ledger: show rows up to `n`, with counting numbers. |
| `data-t="0.5"` | A `.st-track` diagram: the travelling dot reaches this point (0 to 1) when the step is centred. |
| `data-seen="n"` | On any element: it gets `.seen` once a step with `data-ring` of `n` or more has been reached (close-up circles, the forest line). |
| `data-year="2015"` | A `.st-year` counter in the stage counts to this year, or shows a word such as "Today". |
| `data-units="n"` | A `.st-units` canvas (one square per person) shows layer `n`: all squares, then each group, then the highlight. |
| `data-side="right"` | On `.st-steps`: cards on the right, for scenes whose subject sits on the left. |
| Panorama | `.pn-track` in a `data-progress` section: a wide picture that pans sideways with `--p`. |
| Glossary, time-lapse, satellite wipe | Elements with `data-seen` styled by `.seen` and `.is-current`, or stage states keyed on `data-step`, plus `--p` for the wipe. No extra script. |
| `.is-right` | On a single `.st-step`: that card sits on the right. |
| `.th-wrap` | A thread: a line drawn through the `.th-node` markers of a section, revealed down to the middle of the screen, with a glowing tip. Built from the page layout, so it fits any screen. |
| `data-progress` | On a section: sets `--p` (0 to 1) as it scrolls past, for scroll-linked effects (the door, the zone bar, clouds). |

The guide is whatever element has the class `st-guide`: a phone with screens in The Offer, a
plane in The Forest Line. A long picture in normal flow, with cards placed along it by `--at`,
is a fly-over (`.st-fly`).

Text is always real HTML (never baked into pictures), so it stays sharp, translatable and
readable by screen readers. With reduced motion turned on, movement snaps instead of gliding.
Without JavaScript, the scenes and the text simply stack.

## Editing and building

```bash
python3 src/build.py
```

- Story text: `src/the-offer.html` (scenes are pulled in from `src/scenes/*.svg`).
- Styles: `assets/css/story.css`. Engine: `assets/js/story.js`.
- The maps: `cd tools/map && npm install && npm run build` writes `src/scenes/map.svg`;
  `node build-atlantic.mjs` writes `src/scenes/atlantic.svg`.
- The river: `node tools/river/build-river.mjs` writes `src/scenes/river.svg`.
- The Amsterdam map: `cd tools/amsterdam`, fetch `osm.json` with the curl line at the top of
  `build-amsterdam.py` (the query is in `query.overpass`), then `python3 build-amsterdam.py`.
- The Forest Line landscapes: `node tools/forest/build-flyover.mjs` (no dependencies) writes
  `assets/img/forest-flyover.svg`, `assets/img/forest-canopy.svg` and `src/scenes/flyedge.svg`.
- Local preview: `node tools/serve.js`, then open http://localhost:8774/

Asset URLs carry content hashes, so GitHub Pages never serves stale CSS or JS after a push.

## Before anything is published

- **Illustrations are placeholders drawn in code.** They show composition and motion; a
  commissioned illustrator would replace them (same layers, same IDs).
- **Ana is a composite.** No real person is shown, and people are drawn without faces on purpose.
- **Facts to check:** the UNODC line on false job offers; the ILO figures (50 million, 2022;
  $236 billion, 2024); the Dignita and Netherlands figures come from Not For Sale's own pages.
- **Editorial choices to confirm:** the route starts in an unnamed town in eastern Romania (the
  map shows where); the wages, debts and the café manager "Marloes" are illustrative.
- **The Forest Line:** the landscape is one illustrated, compressed flight, not a map. The Brazil
  nut biology (bees, agouti, pods) is general botany for the Peru team to check. New York City is
  compared at its total area (472 sq mi), which is how 753 sq mi comes to about 1.6 times.
- **A Bowl of Soup:** Toos Heemskerk-Schep is named as on Not For Sale's site; ask before
  publishing. The opening hours (09:30 to 16:30) are as listed on the Dignita page. Map pins are
  approximate, and the safe house is deliberately not shown.
- **Slavery Changes Shape:** the text follows Mark Wexler's article. The SlaveVoyages figures
  (12.5 million forced onto ships, about 10.7 million survived) were added for the story and are
  not in the article. The map's routes are drawn by region, not from voyage data.
- **When the Land Breaks, B:** NASA imagery is public domain; the 2025 image contains modified
  Copernicus Sentinel data processed by NASA (HLS). Credit both if it is published.
- **When the Land Breaks:** the source article quotes figures without specific sources (80% of
  displaced people at risk, "up to 60%", 120,000 people, 7,888 km²). They are left out of the
  story; check them before they are used anywhere. The legal definition comes from Not For Sale's
  What is ecocide? page and the 2021 Independent Expert Panel.
- **Spelling:** the stories use American English, like the site. Official names keep their own
  spelling (International Labour Organization, Forced Labour Convention).
- Donate and the other calls to action link to the live site.

## Credits

Map data: Natural Earth (public domain), via world-atlas; Amsterdam from OpenStreetMap
(© OpenStreetMap contributors, ODbL). Fonts: Playfair Display and
Source Serif 4 (SIL Open Font License). Theme code, logo and copy: Not For Sale.
