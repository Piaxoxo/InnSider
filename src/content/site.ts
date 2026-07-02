/**
 * InnSider — content source of truth.
 *
 * Every word of copy lives here so the cinematic chapter components stay
 * purely presentational. The story, positioning, values and brand feeling are
 * elevated from the current InnSider website (innsider-restaurant.at) — Alice
 * Kern's dream, the regional-sourcing philosophy, the Vienna/Meidling home —
 * not reinvented. Chef Stefan is woven in as the heart alongside Alice's soul.
 *
 * Real, verifiable facts (address, contact, opening year) are kept accurate.
 * Photography and video are intentionally deferred: see `content/assets.ts`.
 */

export const site = {
  name: 'InnSider',
  wordmark: 'Inn | Sider', // hair-spaced, as the brand styles it
  city: 'Vienna',
  established: 2024,
  tagline: 'Every unforgettable evening starts somewhere.',
} as const

export const contact = {
  address: {
    street: 'Wurmbstraße 36',
    postal: '1120',
    city: 'Wien',
    country: 'Austria',
    district: 'Meidling',
  },
  phone: '+43 670 182 9565',
  phoneHref: 'tel:+436701829565',
  email: 'office@innsider.at',
  emailHref: 'mailto:office@innsider.at',
  instagram: '@innsider.vienna',
  instagramHref: 'https://www.instagram.com/innsider.vienna/',
} as const

/** The evening's opening rhythm — also drives Chapter 6's timeline. */
export const hours = [
  { day: 'Tuesday – Thursday', time: '17:00 – 23:00' },
  { day: 'Friday – Saturday', time: '17:00 – 01:00' },
  { day: 'Sunday', time: '11:00 – 22:00' },
  { day: 'Monday', time: 'Closed' },
] as const

export const nav = [
  { id: 'hero', label: 'The Evening', index: '01' },
  { id: 'dream', label: 'The Dream', index: '02' },
  { id: 'kitchen', label: 'The Kitchen', index: '03' },
  { id: 'menu', label: 'The Table', index: '04' },
  { id: 'bar', label: 'The Bar', index: '05' },
  { id: 'evening', label: 'The Night', index: '06' },
  { id: 'gallery', label: 'The Rooms', index: '07' },
  { id: 'events', label: 'Occasions', index: '08' },
  { id: 'reservation', label: 'Reserve', index: '09' },
] as const

// ── Chapter 1 — The Evening Begins ──────────────────────────────────────────
export const hero = {
  chapter: 'Chapter One',
  overline: 'InnSider — Vienna',
  headline: ['Every unforgettable', 'evening starts', 'somewhere.'],
  sub: 'Welcome to InnSider. Where atmosphere, hospitality and exceptional cuisine become lasting memories.',
  primaryCta: 'Reserve a table',
  secondaryCta: 'Explore the evening',
  scrollHint: 'Begin the evening',
} as const

// ── Chapter 2 — The Dream (Alice Kern) ──────────────────────────────────────
export const dream = {
  chapter: 'Chapter Two',
  overline: 'The Dream',
  kicker: 'Alice Kern',
  headline: 'She imagined the room\nbefore it existed.',
  paragraphs: [
    'Long before there was a name above the door, there was a feeling Alice Kern could not let go of — the quiet pull of a room where people gather. As a girl she was drawn not only to refined cuisine, but to the spaces that hold it: the warmth of a well-set table, the fall of light against stone, the way a room can make a stranger feel expected.',
    'Her passion for interior and her devotion to detail became a single, stubborn dream — to build a place where the atmosphere is composed as carefully as the menu itself. Not a restaurant with nice decoration, but a space where every corner is considered, and nothing is accidental.',
    'In August 2024, in Vienna’s Meidling, the dream became a room you can walk into. Every surface reflects that same devotion — a marriage of elegance, warmth and individuality. This was never meant to be only a restaurant. It was meant to be an atmosphere you remember.',
  ],
  pullQuote: 'Guests deserve more than dinner. They deserve to feel expected.',
  attribution: 'Alice Kern — Founder',
  buildLabels: ['Sketch', 'Stone', 'Walnut', 'Light', 'The Room'],
} as const

// ── Chapter 3 — The Heart of the Kitchen (Chef Stefan) ──────────────────────
export const kitchen = {
  chapter: 'Chapter Three',
  overline: 'The Kitchen',
  kicker: 'Chef Stefan',
  headline: 'The heart behind every\nunforgettable plate.',
  paragraphs: [
    'If Alice is the soul of InnSider, Stefan is its heart. For him, cooking was never a profession first — it was a language, the one he reaches for when words fall short. In his kitchen, flavour is how a story gets told.',
    'Quality begins at the source. Every ingredient is chosen from regional farms and trusted producers — not for a label, but because he has stood in those fields and shaken those hands. Freshness and authenticity are not features here. They are the starting line.',
    'Nothing leaves his pass until it is exactly right. A plate is finished not when it is full, but when it meets his standard — the standard he would set for someone he loves. Trust him before you taste anything; the plate will keep the promise.',
  ],
  philosophy: [
    { n: '01', title: 'Every ingredient has a purpose', body: 'Sourced from regional farms and trusted producers, selected for the season rather than the shelf.' },
    { n: '02', title: 'Every flavour tells a story', body: 'Composed to be read, not just eaten — a beginning, a turn, a finish that lingers.' },
    { n: '03', title: 'Every plate meets one standard', body: 'His. Nothing leaves the kitchen until it does. There is no faster way, and he isn’t looking for one.' },
  ],
  pullQuote: 'Cooking is a language. Every plate is a sentence I mean.',
  attribution: 'Chef Stefan',
} as const

// ── Chapter 4 — The Table (menu) ────────────────────────────────────────────
export const menu = {
  chapter: 'Chapter Four',
  overline: 'The Table',
  headline: 'Read it slowly.\nIt was written that way.',
  intro: 'A short, changing menu built around what the season gives us. These are a few of the plates guests return for — the full card lives at your table.',
  seasonNote: 'A taste of the season',
  dishes: [
    {
      name: 'Geschmorte Rindsbackerln',
      en: 'Slow-braised beef cheeks',
      note: 'Wine-dark jus, root vegetables, silk-soft after hours in the pot.',
      price: '18.80',
      pairing: 'Blaufränkisch, Burgenland',
      tag: 'Signature',
    },
    {
      name: 'Fischfilet im Speckmantel',
      en: 'Speck-wrapped fish, tomato risotto',
      note: 'Delicate fish under crisp speck, on a tomato risotto with summer vegetables.',
      price: '19.80',
      pairing: 'Grüner Veltliner, Wachau',
      tag: 'From the pass',
    },
    {
      name: 'Radicchio, Birne & Walnuss',
      en: 'Radicchio, pear & candied walnut',
      note: 'Bitter leaves, sweet pear, burrata and toasted walnut with warm flatbread.',
      price: '12.80',
      pairing: 'Sauvignon Blanc, Steiermark',
      tag: 'Vegetarian',
    },
    {
      name: 'Pfirsich & Burrata',
      en: 'Summer stone fruit & burrata',
      note: 'Ripe peach, creamy burrata and chervil — summer on a plate.',
      price: '13.80',
      pairing: 'Rosé, Neusiedlersee',
      tag: 'Seasonal',
    },
    {
      name: 'Gewürzhähnchen-Wrap',
      en: 'Spiced chicken, herbs, flatbread',
      note: 'Warm-spiced chicken, fresh herbs and soft flatbread. Made to be picked up.',
      price: '14.80',
      pairing: 'Riesling, Kamptal',
      tag: 'Handheld',
    },
    {
      name: 'The InnSider Burger',
      en: '200g Austrian beef',
      note: 'House-baked bun, coleslaw, aged cheddar, potato wedges. Quietly perfect.',
      price: '15.80',
      pairing: 'Zweigelt, Carnuntum',
      tag: 'The Classic',
    },
  ],
} as const

// ── Chapter 5 — The Bar ─────────────────────────────────────────────────────
export const bar = {
  chapter: 'Chapter Five',
  overline: 'The Bar',
  headline: 'The lights come down.\nThe night opens up.',
  intro: 'When dinner settles, the room changes key. Brass warms, glass catches candlelight, and the bar takes over the storytelling.',
  drinks: [
    { name: 'The Golden-Hour Spritz', base: 'Aperol · prosecco · orange', mood: 'Sun in a glass' },
    { name: 'The Meidling Old Fashioned', base: 'Rye · house bitters · burnt orange', mood: 'Slow & amber' },
    { name: 'Alice’s Garden', base: 'Gin · elderflower · garden herbs', mood: 'Bright & green' },
    { name: 'The Nightcap', base: 'Cognac · coffee · cream', mood: 'The last word' },
  ],
} as const

// ── Chapter 6 — The Evening Evolves (timeline) ──────────────────────────────
export const evening = {
  chapter: 'Chapter Six',
  overline: 'The Night',
  headline: 'Stay a while.\nWatch the light change.',
  intro: 'An evening at InnSider is not a booking. It is an arc — and you are welcome for all of it.',
  timeline: [
    { time: '18:00', title: 'Golden Hour', body: 'The last light leans through the windows. First glasses, first laughter, the room warming up.' },
    { time: '19:30', title: 'Dinner', body: 'The kitchen finds its rhythm. Plates arrive, conversation deepens, the evening finds its center.' },
    { time: '21:00', title: 'Wine', body: 'A second bottle, an easier pace. Nobody is checking the time anymore.' },
    { time: '22:30', title: 'Cocktails', body: 'The bar takes the lead. Brass and candlelight, the night’s second act.' },
    { time: '23:30', title: 'Stories', body: 'The best hour. Low light, low voices, the reason people come back years later.' },
  ],
} as const

// ── Chapter 7 — The Rooms (gallery / exhibition) ────────────────────────────
export const gallery = {
  chapter: 'Chapter Seven',
  overline: 'The Rooms',
  headline: 'Every corner\nwas considered.',
  intro: 'Walk the room the way a guest does — stone and walnut, brass and candlelight, the details that only reveal themselves when you slow down.',
  frames: [
    { title: 'The Front Room', story: 'Where the evening begins — warm light, the first hello.' },
    { title: 'The Long Table', story: 'For the nights that turn into occasions.' },
    { title: 'The Bar', story: 'Brass, glass and candlelight after dark.' },
    { title: 'The Corner', story: 'The table people ask for by name.' },
    { title: 'The Pass', story: 'Where Stefan lets nothing leave until it’s right.' },
    { title: 'The Details', story: 'Stone, walnut, fabric — nothing accidental.' },
  ],
} as const

// ── Chapter 8 — Occasions (private events) ──────────────────────────────────
export const events = {
  chapter: 'Chapter Eight',
  overline: 'Occasions',
  headline: 'Some evenings\ndeserve the whole room.',
  intro: 'Birthdays and business, weddings and the quiet anniversaries — InnSider holds the evenings that matter, exactly the way you imagined them.',
  cards: [
    { title: 'Celebrations', body: 'Birthdays and anniversaries with the room to yourselves and a menu made for the occasion.' },
    { title: 'Business Dinners', body: 'Discreet, considered and unhurried — the kind of table where good things get decided.' },
    { title: 'Weddings & Toasts', body: 'The intimate reception, the rehearsal, the morning-after brunch — held with care.' },
    { title: 'The Festive Season', body: 'Christmas and year’s-end evenings, candlelit and generous, the way winter should feel.' },
    { title: 'Private Dining', body: 'A room within the room, for the evenings meant only for your people.' },
  ],
  cta: 'Enquire about your evening',
} as const

// ── Chapter 9 — Reservation (finale) ────────────────────────────────────────
export const reservation = {
  chapter: 'Chapter Nine',
  overline: 'Reserve',
  headline: 'Your table\nis waiting.',
  sub: 'Tell us the evening you have in mind. We’ll hold the rest.',
  cta: 'Reserve your evening',
  fields: {
    name: 'Your name',
    email: 'Email',
    date: 'Preferred date',
    guests: 'Guests',
    occasion: 'The occasion (optional)',
  },
  reassurance: 'We reply to every request personally, usually within the day.',
} as const

export const footer = {
  line: 'Where atmosphere, hospitality and exceptional cuisine become lasting memories.',
  credit: 'InnSider — Vienna, Meidling. Imagined by Alice Kern.',
} as const
