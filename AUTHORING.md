# Briefing a new story

How to ask for a new scroll story like the six in this repo. The design system and the scroll
engine are already fixed here, so a brief does not need to describe them. It needs to supply the
four things nobody can work out from the article alone.

## The four things that matter

1. **The guide.** Every story is one thing travelling down the page: a phone in The Offer, a plane
   in The Forest Line, a bowl in A Bowl of Soup, a paper boat in Upstream, an orange thread in
   Slavery Changes Shape. Without one the story becomes a slideshow. Pick something that belongs
   to the story and can plausibly move through every chapter.
2. **Chapter beats, not prose.** One line per chapter, describing what happens on screen, like the
   tables in the [README](README.md). "A year counts up while the bowl moves from pin to pin" is a
   brief. "Explain how Dignita grew" is not.
3. **The real article, pasted in full.** Do not summarize it first. Four of the six stories come
   from one live article, and the quality comes from having the actual sentences.
4. **What must not be shown.** Say it out loud: no real survivors, no exact locations, composites
   labeled as composites. People in these stories are drawn without faces on purpose.

## The prompt

Copy this, fill in the angle brackets, delete what does not apply.

```
Create a new Not For Sale scroll story in the nfs-stories-mockup repo
(granittemaj/nfs-stories-mockup), following the conventions already used by
the six existing stories.

SOURCE MATERIAL
- Article or facts: <paste the live article URL, or the full text>
- Figures that must appear: <e.g. 4,561 people; 753 square miles>
- Must NOT be named or shown: <real survivors, exact safe-house locations, ...>

THE STORY
- Working title: <...>
- Slug: <kebab-case, becomes /slug/>
- In one sentence, what should the reader understand by the end: <...>
- THE GUIDE: <the single object the reader follows down the page>
- Chapters: 5 to 8 beats, one line each:
    1. <...>
    2. <...>
- Ending: the call to action, and which pages to link to.

PICTURES
Default: scenes are illustrations drawn in code (SVG), as in the other stories.
If I am supplying real photographs instead, for each one:
- File: <path or attachment>  (put it in assets/img/, reference ../assets/img/<file>)
- Where it goes: <full-bleed opening | long fly-over the reader travels down |
  small inset close-up with a caption | side-by-side then-and-now>
- Caption and credit: <...>
- Alt text: <what a blind reader needs to know>
- Permission: <who cleared it, and any restriction>
Rules for photos: no identifiable survivors or faces without written consent;
words stay in HTML on top, never baked into the image; supply the largest
version you have and I will size it.

LINKS
- Live site pages this should link to: <URLs>
- Other stories in this repo to link to: <slug(s)>
- Sources to list at the end: <URL per fact>
Every figure in the closing section names where it came from, as in the
existing stories.

RULES (do not change)
- Use the repo's existing engine and design system: assets/js/story.js,
  assets/css/story.css, Playfair Display and Source Serif 4, brand orange
  #F5821F. No new libraries, no new fonts.
- All text is real HTML. Never bake words into a picture.
- Scenes are inline SVG in src/scenes/<name>.svg, pulled in with <!--scene:name-->.
- Drive motion with the existing step attributes: data-g, data-cam, data-ring,
  data-t, data-stop, data-year, data-units, data-seen, data-progress. Only
  invent a new attribute if nothing fits, and say so in the handover.
- Must still read as stacked text and pictures with JavaScript off, and must
  hold still under prefers-reduced-motion.
- American English. Write "Not For Sale" in full. No em dashes.
- Invent no figures. Anything without a source stays out. Label composites.
- Wire it up: create src/<slug>.html, register it in src/build.py, add a hub
  card in src/hub.html, then run python3 src/build.py.

DELIVER
The built story at /<slug>/, a card on the hub, and a short list of every fact,
name and photo permission the team must verify before this is published.
```

## The short version

When there is no time for the full brief:

> Build a new Not For Sale scroll story called **\<title\>** from this article: **\<URL\>**. The
> guide is **\<object\>**. Chapters: **\<five to eight one-line beats\>**. Follow all the
> conventions in the repo README: existing engine, existing design system, real HTML text, no
> invented figures, and list what needs fact checking.

## Using real photographs

The illustrations in all six stories are placeholders drawn in code. They show composition and
motion, and the plan has always been that an illustrator or a photographer replaces them using the
same layers and IDs. Expect a new story to come back the same way.

Photographs do not need a redesign. The image slots already exist and are already set to fill their
frame, so a photograph drops into the place an illustration sits and the motion is unchanged:

| Slot | Used for | Example |
| --- | --- | --- |
| Full-bleed opening | The picture behind the title | `.fo-canopy` in The Forest Line |
| Fly-over | One long picture the reader travels down, cards placed along it | `.fly-img` in The Forest Line |
| Inset close-up | A small circle that pops out of the scene, with a caption | `.st-inset` |
| Then and now | Scrolling wipes from one picture to the other | A Bowl of Soup |

Mixing is normal, and probably the realistic outcome: photographs where the rights are cleared,
drawings for scenes nobody could photograph, such as the inside of a locked kitchen.

**Before attaching a photograph:** this repo is public. Pages are `noindex`, which is right for a
mockup, but anything attached here is reachable by anyone with the address. If a picture is
sensitive or not yet cleared, say so in the brief and leave it as a drawing until the story moves
to the live site.

## Linking out

Stories link three ways, all of them already styled:

- **To the live site:** full URLs to `wearenotforsale.org`, for the article the story came from and
  for the pages that carry the facts.
- **To another story here:** a relative link such as `../the-offer/`. Several stories end by
  pointing at a related one.
- **Sources:** the closing section lists where every figure came from. Keep it, it is the reason
  the stories can be trusted.

## What a brief cannot change

The design system, the type, the engine and the accessibility rules are settled, and a story that
breaks them stops looking like the site. If something genuinely cannot be told inside those rules,
say so in the brief and it gets discussed rather than quietly worked around.

See [README](README.md) for the full list of building blocks, the step attributes and the build
commands.
