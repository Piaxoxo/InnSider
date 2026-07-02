/**
 * DEFERRED MEDIA MANIFEST
 * ───────────────────────
 * Professional photography & video will be delivered later. Until then every
 * media slot renders a premium placeholder (see components/Placeholder.tsx).
 *
 * TO GO LIVE WITH REAL ASSETS:
 *   1. Drop the file into /public/media/ using the `src` path below.
 *   2. That's it — layouts are sized by aspect ratio, not by the image, so
 *      nothing shifts and no animation breaks when the real asset appears.
 *
 * Every slot declares its intended `ratio` and a `note` describing the shot,
 * so a photographer/editor can shoot to spec. `src` is null until delivered.
 */

export interface MediaSlot {
  id: string
  kind: 'image' | 'video'
  ratio: number // width / height — reserves layout space so real assets drop in cleanly
  label: string // shown on the placeholder
  note: string // art-direction brief for the shoot
  src: string | null // set to '/media/…' when the real asset is delivered
}

const slot = (
  id: string,
  kind: MediaSlot['kind'],
  ratio: number,
  label: string,
  note: string,
): MediaSlot => ({ id, kind, ratio, label, note, src: null })

// A slot pre-wired to a real, delivered asset. If the file isn't on disk yet
// the Placeholder falls back to the stub, so this is always safe to set.
const live = (
  id: string,
  ratio: number,
  label: string,
  note: string,
  src: string,
): MediaSlot => ({ id, kind: 'image', ratio, label, note, src })

// Aspect ratios of the delivered brand photography.
const R = 3 / 2 // landscape
const RP = 2 / 3 // portrait

export const media = {
  heroAmbient: slot('hero-ambient', 'video', 16 / 9, 'Hero film', 'Slow push through the candlelit room at golden hour — steam, glass, light rays.'),

  // DELIVERED — the InnSider facade: guests at the window counters, brick and
  // brass, summer light. The dream become a room you can walk into.
  aliceRoom: live('alice-room', R, 'Der Raum, den sie erschuf', 'Die Innsider-Fassade — Gäste am Fenster, Ziegel, Messing, Sommerlicht.', '/media/innsider-facade-guests.jpg'),

  // DELIVERED — Chef Stefan in der Küche.
  stefanPortrait: live('stefan-portrait', 4 / 5, 'Chef Stefan', 'In der Küche – „Super-Koch Stefan".', '/media/stefan-portrait.jpg'),
  // DELIVERED — a plated close-up: radicchio, burrata and a rose, the craft.
  stefanHands: live('stefan-hands', R, 'The craft', 'A finished plate, close — radicchio, burrata, chervil, a rose.', '/media/craft-salad-macro.jpg'),
  kitchenFire: slot('kitchen-fire', 'video', 16 / 9, 'Kitchen motion', 'Loop: flame, knife, steam — cinematic, shallow depth of field.'),

  // ── Gaumenfreuden — echte Fotos aus der Küche (neutrale, nicht erfundene
  // Bild-Beschriftungen; die verifizierte Karte steht in content/site.ts) ──
  // DELIVERED — Teller aus der Küche.
  dishFish: live('dish-fish', RP, 'Aus der Küche', 'Frisch angerichtet.', '/media/dish-fish-risotto.jpg'),
  // DELIVERED — Salatteller.
  dishRadicchio: live('dish-radicchio', R, 'Frisch & regional', 'Knackig, saisonal.', '/media/dish-radicchio.jpg'),
  // DELIVERED — sommerlicher Teller.
  dishPeach: live('dish-peach', R, 'Sommerlich', 'Leicht und frisch.', '/media/dish-peach-burrata.jpg'),
  // DELIVERED — Teller vom Mittagstisch.
  dishChicken: live('dish-chicken', R, 'Vom Mittagstisch', 'Täglich frisch zubereitet.', '/media/dish-chicken-wrap.jpg'),
  // DELIVERED — Rote-Bete-Salat mit Ziegenkäse, zwei Perspektiven.
  dishBeet1: live('dish-beet-1', R, 'Rote Bete & Ziegenkäse', 'Rucola, Balsamico, knusprige Croûtons.', '/media/dish-beet-1.jpg'),
  dishBeet2: live('dish-beet-2', R, 'Liebevoll angerichtet', 'Geschmack, Textur und Präsentation in Harmonie.', '/media/dish-beet-2.jpg'),

  // „A taste of the season" — weitere Teller.
  // DELIVERED — Suppe (echt: Gäste loben die ausgezeichneten Suppen).
  seasonSoup: live('season-soup', R, 'Suppe des Tages', 'Zu jedem Mittagsmenü.', '/media/season-soup.jpg'),
  // DELIVERED — Salat im Fensterlicht.
  seasonSalad: live('season-salad', R, 'Aus dem Garten', 'Frisch und leicht.', '/media/season-salad.jpg'),
  // DELIVERED — Detail am Tellerrand.
  seasonRose: live('season-rose', R, 'Liebe zum Detail', 'Nichts dem Zufall überlassen.', '/media/season-rose.jpg'),

  // ── The Bar — cocktails & a golden-hour guest ──
  // DELIVERED — the Aperol spritz in full sun.
  cocktailAperol: live('cocktail-aperol', RP, 'The Spritz', 'Aperol, orange and ice, glowing in the afternoon sun.', '/media/cocktail-aperol.jpg'),
  // DELIVERED — a guest at the window bar with a spritz, golden light.
  barGuest: live('bar-guest', RP, 'Golden hour', 'A guest at the window bar, spritz in hand, sun on brick.', '/media/bar-guest-aperol.jpg'),

  // DELIVERED — friends toasting at the brick bar counter, beer and Aperol.
  // Drives the Bar chapter's full-bleed backdrop.
  barScene: live('bar-scene', R, 'The bar after dark', 'A toast at the counter — brick, brass and good company.', '/media/bar-cheers.jpg'),
  // DELIVERED — a server mid-conversation with guests, warm and easy.
  barServer: live('bar-server', RP, 'Hospitality', 'A server mid-conversation with guests — the room in good hands.', '/media/server-table.jpg'),

  // DELIVERED — a guest outside on the street, mid-laugh at golden hour.
  room1: live('room-1', R, 'The welcome', 'A guest on the street outside, mid-laugh — the evening beginning.', '/media/guest-portrait.jpg'),
  // DELIVERED — wine poured at the table over dinner, glasses catching the light.
  room2: live('room-2', R, 'The long table', 'Wine poured over dinner — the evening finding its center.', '/media/wine-pour-table.jpg'),
  // DELIVERED — the bar counter: taps, shelved glassware, reclaimed wood.
  room3: live('room-3', RP, 'The bar', 'The counter — taps, glassware and reclaimed wood.', '/media/bar-counter-detail.jpg'),
  // DELIVERED — the teal reading nook with the vintage-camera wall.
  room4: live('room-4', R, 'The corner', 'The teal nook and its wall of vintage cameras.', '/media/interior-nook-teal.jpg'),
  // DELIVERED — the golser beer taps, close and gleaming.
  room5: live('room-5', R, 'On tap', 'Golser on draught — chrome, warm light, ready to pour.', '/media/beer-taps.jpg'),
  // DELIVERED — the wine cabinet, a hand drawing a Blaufränkisch from the rack.
  room6: live('room-6', R, 'The cellar', 'The wine cabinet — a Blaufränkisch drawn from the rack.', '/media/wine-fridge-brueckner.jpg'),

  // DELIVERED — the full room: bar, industrial lights, tables ready.
  eventsRoom: live('events-room', 16 / 9, 'The whole room', 'The dining room and bar, dressed and ready for the evening.', '/media/interior-bar-wide.jpg'),

  // ── Occasions — real celebration moments ──
  // DELIVERED — a bottle of Moët rosé glowing in the sun.
  eventChampagne: live('event-champagne', RP, 'To celebrate', 'A bottle of rosé champagne, caught in the afternoon light.', '/media/event-champagne.jpg'),
  // DELIVERED — a long table of friends over dinner, phones and laughter.
  eventGathering: live('event-gathering', R, 'The table, full', 'A long table of friends, mid-celebration — the room at its warmest.', '/media/event-gathering.jpg'),
  // DELIVERED — an evening dinner in close conversation.
  eventDinner: live('event-dinner', R, 'Deep in the evening', 'Dinner and drinks, conversation leaning in.', '/media/event-dinner.jpg'),
  // DELIVERED — guests mingling and welcomed at a party.
  eventWelcome: live('event-welcome', R, 'Arrivals', 'Coats still on, first hellos — a gathering coming together.', '/media/event-welcome.jpg'),
  // DELIVERED — two guests in a warm embrace at an event.
  eventEmbrace: live('event-embrace', R, 'Reunions', 'An embrace across the room — the reason people come back.', '/media/event-embrace.jpg'),
} as const

export type MediaKey = keyof typeof media
