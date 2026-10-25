// The frames captured from each story, in story order: which section, and which of its steps, to
// stop on. They play as a short trailer on the hub. Files: assets/img/posters/<slug>-<n>-<wide|tall>.webp
export const SHOTS = [
  { slug: 'the-offer', frames: [['#home', 1], ['#journey', 3], ['#kitchen', 1], ['#signs', 0], ['#way-out', 2], ['#dignita', 1]] },
  { slug: 'the-forest-line', frames: [['#above', 1], ['#flyover', 2], ['#flyover', 9], ['#tree', 1], ['#scale', 1]] },
  { slug: 'a-bowl-of-soup', frames: [['#soup', 1], ['#home-soup', 1], ['#amsterdam', 2], ['#recipe', 2], ['#people', 2], ['#then-now', 2]] },
  { slug: 'slavery-changes-shape', frames: [['#atlantic', 2], ['#atlantic', 6], ['#laws', 3], ['#today', 1], ['#new-shapes', 2]] },
  { slug: 'upstream', frames: [['#a-river', 1], ['#river', 2], ['#river', 4], ['#river', 6], ['#words', 2]] },
  { slug: 'when-the-land-breaks', frames: [['#coast', 1], ['#coast', 5], ['#coast', 7], ['#at-sea', 0], ['#replant', 2]] },
];
