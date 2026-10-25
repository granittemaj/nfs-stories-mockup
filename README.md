# Not For Sale stories · mockup

Concept mockups for scroll-driven visual stories on [wearenotforsale.org](https://wearenotforsale.org),
inspired by Reuters Graphics, in particular
[Inside Ukraine's Kill Zone](https://www.reuters.com/graphics/UKRAINE-CRISIS/KILL-ZONE/znpnojmknvl/)
(the drone that comes down as you scroll and carries the story).

**Not the live site.** Pages are `noindex`. Built in the site's own design system: the papingu
theme's `styles.css`, `app.js` (header, footer, newsletter, search) and fonts.

- Stories hub: [`index.html`](index.html)
- Story 01, The Offer: [`the-offer/`](the-offer/)

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

Text is always real HTML (never baked into pictures), so it stays sharp, translatable and
readable by screen readers. With reduced motion turned on, movement snaps instead of gliding.
Without JavaScript, the scenes and the text simply stack.

## Editing and building

```bash
python3 src/build.py
```

- Story text: `src/the-offer.html` (scenes are pulled in from `src/scenes/*.svg`).
- Styles: `assets/css/story.css`. Engine: `assets/js/story.js`.
- The map: `cd tools/map && npm install && npm run build` writes `src/scenes/map.svg`.
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
- The Donate and "Learn the signs" links go to the live site.

## Credits

Map data: Natural Earth (public domain), via world-atlas. Fonts: Playfair Display and
Source Serif 4 (SIL Open Font License). Theme code, logo and copy: Not For Sale.
