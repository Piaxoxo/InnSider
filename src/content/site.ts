/**
 * InnSider — Inhalt (Single Source of Truth).
 *
 * Der Text stammt 1:1 von der echten Website innsider-restaurant.at
 * (Story, „Kulinarische Vielfalt", „Top Drinks", „Gaumenfreuden",
 * „Erinnerungen, die bleiben", die echte Timeline und echte Google-Bewertungen).
 * Nichts hier ist erfunden — nur verifizierte Fakten und Originaltexte.
 * Wo noch echte Angaben fehlen (z. B. genaue Öffnungszeiten), steht ein
 * ehrlich gekennzeichneter Platzhalter statt einer Fantasieangabe.
 */

export const site = {
  name: 'InnSider',
  wordmark: 'Inn | Sider',
  city: 'Wien',
  established: 2024,
  tagline: 'Eine Vision wird Wirklichkeit.',
} as const

export const contact = {
  address: {
    street: 'Wurmbstraße 36',
    postal: '1120',
    city: 'Wien',
    country: 'Österreich',
    district: 'Meidling',
  },
  phone: '+43 670 182 9565',
  phoneHref: 'tel:+436701829565',
  email: 'office@innsider.at',
  emailHref: 'mailto:office@innsider.at',
  instagram: '@innsider.vienna',
  instagramHref: 'https://www.instagram.com/innsider.vienna/',
} as const

export const nav = [
  { id: 'hero', label: 'Willkommen', index: '01' },
  { id: 'dream', label: 'Die Vision', index: '02' },
  { id: 'kitchen', label: 'Die Küche', index: '03' },
  { id: 'menu', label: 'Gaumenfreuden', index: '04' },
  { id: 'bar', label: 'Bar', index: '05' },
  { id: 'evening', label: 'Timeline', index: '06' },
  { id: 'gallery', label: 'Location', index: '07' },
  { id: 'events', label: 'Events', index: '08' },
  { id: 'reservation', label: 'Reservieren', index: '09' },
] as const

// ── Kapitel 1 — Willkommen ──────────────────────────────────────────────────
export const hero = {
  chapter: 'Kapitel Eins',
  overline: 'Innsider — Wien',
  headline: ['Herzlich willkommen.', 'Eine Vision', 'wird Wirklichkeit.'],
  sub: 'Mehr als ein Restaurant — ein sorgfältig gestaltetes Ambiente, in dem Gäste nicht nur außergewöhnlich speisen, sondern ein sinnliches Gesamterlebnis genießen.',
  primaryCta: 'Tisch reservieren',
  secondaryCta: 'Entdecken',
  scrollHint: 'Der Abend beginnt',
} as const

// ── Kapitel 2 — Die Vision (Alice Kern) — Originaltext ───────────────────────
export const dream = {
  chapter: 'Kapitel Zwei',
  overline: 'Die Vision',
  kicker: 'Alice Kern',
  headline: 'Eine Vision\nwird Wirklichkeit.',
  paragraphs: [
    'Schon in jungen Jahren war Alice Kern nicht nur von erlesener Küche fasziniert, sondern auch von den Räumen, in denen Menschen zusammenkommen. Ihre Leidenschaft für Interior Design und ihr Auge fürs Detail entfachten einen Traum: einen Ort zu schaffen, an dem Atmosphäre und Ästhetik ebenso sorgfältig komponiert sind wie das Menü selbst.',
    'Im August 2024 wurde dieser Traum mit der Eröffnung des Innsider Restaurants Wirklichkeit. Jeder Winkel spiegelt Alices Hingabe zum Design wider – eine Verbindung aus Eleganz, Wärme und Individualität. Mehr als ein Restaurant ist das Innsider ein sorgfältig gestaltetes Ambiente, in dem Gäste nicht nur außergewöhnlich speisen, sondern ein sinnliches Gesamterlebnis genießen.',
  ],
  pullQuote: 'Mehr als ein Restaurant – ein Ort zum Erleben und Erinnern.',
  attribution: 'Innsider · Wien',
  buildLabels: ['Skizze', 'Stein', 'Nussholz', 'Licht', 'Der Raum'],
} as const

// ── Kapitel 3 — Die Küche (Chef Stefan) — „Kulinarische Vielfalt" ────────────
export const kitchen = {
  chapter: 'Kapitel Drei',
  overline: 'Die Küche',
  kicker: 'Chef Stefan',
  headline: 'Qualität beginnt\nan der Quelle.',
  paragraphs: [
    'Im Innsider beginnt Qualität an der Quelle. Jede Zutat wird sorgfältig von regionalen Höfen und vertrauenswürdigen Produzenten ausgewählt, um Frische und Authentizität in jedem Bissen zu garantieren.',
    'Von knackigem Gemüse bis zu zarten Fleischstücken – die Aromen sprechen für sich. Selbst unser Fladenbrot wird täglich im Haus gebacken und verleiht Ihrem Genusserlebnis den letzten Hauch hausgemachter Vollkommenheit.',
    'In der Küche steht Chef Stefan – von Gästen als „Super-Koch" gefeiert. Er kocht alles frisch, mit spürbarer Sorgfalt, und genau das schmeckt man auf jedem Teller.',
  ],
  philosophy: [
    { n: '01', title: 'Qualität an der Quelle', body: 'Jede Zutat von regionalen Höfen und vertrauenswürdigen Produzenten – Frische und Authentizität in jedem Bissen.' },
    { n: '02', title: 'Täglich hausgebacken', body: 'Selbst das Fladenbrot wird jeden Tag im Haus gebacken – der letzte Hauch hausgemachter Vollkommenheit.' },
    { n: '03', title: 'Alles frisch gekocht', body: 'Chef Stefan kocht alles frisch – von Gästen immer wieder für Qualität und Preis/Leistung gelobt.' },
  ],
  pullQuote: 'Geniales, neues Lokal mit Super-Koch Stefan! Er kocht alles frisch, die Getränke sind top. Klare Empfehlung.',
  attribution: 'Alexander B. · Google-Bewertung',
} as const

// ── Kapitel 4 — Gaumenfreuden (Menü) — nur verifizierte Gerichte ─────────────
export const menu = {
  chapter: 'Kapitel Vier',
  overline: 'Gaumenfreuden',
  headline: 'Eine Reise\nfür alle Sinne.',
  intro: 'Jedes Gericht wird mit höchster Präzision zubereitet und vereint Geschmack, Textur und Präsentation zu vollkommener Harmonie. Von den Vorspeisen bis zu den Desserts erzählt jeder Teller eine Geschichte.',
  galleryNote: 'Gaumenfreuden',
  // Echte Speisekarte 1:1 aus der PDF (Speisekarte1.pdf).
  sections: [
    {
      title: 'Vorspeisen & Suppen',
      items: [
        { name: 'Tagessuppe', note: 'wechselt wöchentlich', price: '5,80', allergens: '', plus: '' },
        { name: 'Beef Tatar', note: 'Focaccia, Eiercreme, Kapernbeeren, Babyspinat und Grana', price: '19,20', allergens: 'A C G H L', plus: '' },
        { name: 'Kaspressknödelsalat', note: 'Apfelmus, Kräutercreme, Radieschen und Walnuss', price: '10,80', allergens: 'A C G', plus: 'Als Hauptspeise € 14,90' },
      ],
    },
    {
      title: 'Hauptspeisen',
      items: [
        { name: 'Original indisches Butternut Chicken', note: 'Paratha-Brot und Salat', price: '17,20', allergens: 'A O', plus: '' },
        { name: 'Feuriges Chili con Carne', note: 'Sauerrahm und Fladenbrot', price: '12,50', allergens: 'A E G', plus: '' },
        { name: 'Deftiges Blunzngröstl', note: 'Erdäpfel, Junglauch, Spiegelei, Kren und Krautsalat', price: '14,50', allergens: 'A C G O', plus: '' },
        { name: 'Innsider Burger', note: '200g österreichisches Rindfleisch im hausgemachten Bun, Hamburgersauce, Cheddar, Bacon, karamellisierte Zwiebel und Wedges', price: '18,40', allergens: 'A C G O', plus: '' },
        { name: 'Veggie Burger', note: 'Erbsenprotein-Patty, Gazi Käse, Granatapfel, Kräutercreme, Babyspinat und Süßkartoffel-Pommes', price: '15,80', allergens: 'A C F G H', plus: '' },
        { name: 'Gelbes Gemüsecurry', note: 'Basmatireis und Kokosmilch — vegan', price: '12,80', allergens: 'A F L O', plus: 'mit Hühnerbrust + 6,00 · mit Garnelen + 7,00' },
        { name: 'Spinatknödel mit Bierkäse', note: 'Tomatenbutter mit Pinienkernen und Salat', price: '13,80', allergens: 'A C G H', plus: '' },
        { name: 'Caesar Salad', note: 'Römersalat, Kirschtomaten, original Caesar Dressing und Weißbrotcroutons', price: '9,80', allergens: 'A C D G O', plus: 'mit Hühnerbrust + 6,00 · mit Garnelen + 7,00' },
      ],
    },
    {
      title: 'Desserts',
      items: [
        { name: 'Marmeladepalatschinken', note: 'Marillen- oder Erdbeermarmelade mit Schlag', price: '7,80', allergens: 'A C G', plus: '' },
        { name: 'Eispalatschinken', note: 'Vanilleeis, Schokosauce, Schlagobers und karamellisierte Walnüsse', price: '9,80', allergens: 'A C G H', plus: '' },
        { name: 'Hausgemachter Kuchen', note: 'aus unserer Vitrine', price: '4,90', allergens: '', plus: '' },
      ],
    },
  ],
  priceNote: 'Preise beinhalten die gesetzlichen Abgaben.',
  allergenNote: 'Allergene: A, C, D, E, F, G, H, L, O — Details gerne auf Anfrage.',
  pdfLabel: 'Speisekarte als PDF',
  pdfHref: 'speisekarte.pdf',
  foot: 'Die vollständige, wechselnde Karte liegt an Ihrem Tisch bereit.',
} as const

// ── Kapitel 5 — Bar (Top Drinks) — Originaltext ──────────────────────────────
export const bar = {
  chapter: 'Kapitel Fünf',
  overline: 'Bar · Top Drinks',
  headline: 'Jedes Glas\nist Teil des Erlebnisses.',
  intro: 'Unsere Bar bietet eine sorgfältig kuratierte Auswahl an österreichischen Weinen, internationalen Etiketten und handwerklich gebrauten Bieren – mit Leidenschaft und Hingabe gewählt.',
  drinks: [
    { name: 'Österreichische Weine', base: 'u. a. Brückner Blaufränkisch', mood: 'Regional & charaktervoll' },
    { name: 'Internationale Etiketten', base: 'Sorgfältig kuratiert', mood: 'Weltweit gewählt' },
    { name: 'Handwerkliche Biere', base: 'Golser vom Fass', mood: 'Frisch gezapft' },
    { name: 'Aperol Spritz', base: 'Der Sommer im Glas', mood: 'Frisch & belebend' },
  ],
} as const

// ── Kapitel 6 — Timeline — Originaltext (echte Jahreszahlen) ─────────────────
export const evening = {
  chapter: 'Kapitel Sechs',
  overline: 'Timeline',
  headline: 'Vom Traum\nzum Innsider.',
  intro: 'Ein Weg, der über Jahrzehnte hierher geführt hat.',
  timeline: [
    { time: '1961', title: 'Erste Schritte', body: 'Die Geburt von Alice Kern – der Beginn einer Reise, die eines Tages Leidenschaft für Design, Gastlichkeit und kulinarische Exzellenz vereinen sollte.' },
    { time: '2023', title: 'Eine Vision nimmt Gestalt an', body: 'Das historische Haus wurde mit einem Traum erworben: ein Ort, an dem Architektur, Design und erlesene Küche in vollkommener Harmonie zusammenfinden.' },
    { time: 'Aug 2024', title: 'Grand Opening', body: 'Das Innsider Restaurant öffnete offiziell seine Türen – die ersten Gäste wurden in einem außergewöhnlichen Ambiente willkommen geheißen.' },
    { time: 'Dez 2024', title: 'Erste Events', body: 'Das Innsider richtete seine ersten erfolgreichen Firmenevents aus – der Grundstein für viele unvergessliche Momente, die noch folgen sollten.' },
  ],
} as const

// ── Kapitel 7 — Location — „Erinnerungen, die bleiben" ───────────────────────
export const gallery = {
  chapter: 'Kapitel Sieben',
  overline: 'Unsere Location',
  headline: 'Einer der fotogensten\nOrte Wiens.',
  intro: 'Unser Interieur verbindet Eleganz mit modernem Design – ein Ambiente, das zugleich raffiniert und einladend wirkt. Warmes Licht, einzigartige Details und markante Akzente machen jede Ecke besonders.',
  frames: [
    { title: 'Der Empfang', story: 'Warmes Licht, das erste Willkommen.' },
    { title: 'Die lange Tafel', story: 'Für Abende, die zu Anlässen werden.' },
    { title: 'Die Bar', story: 'Messing, Glas und warmes Licht.' },
    { title: 'Die Ecke', story: 'Der Tisch, den man beim Namen kennt.' },
    { title: 'Details', story: 'Stein, Holz, Stoff – nichts dem Zufall überlassen.' },
    { title: 'Warmes Licht', story: 'Der fotogenste Winkel des Hauses.' },
  ],
} as const

// ── Kapitel 8 — Events — echt (seit Dez 2024 Firmenevents) ───────────────────
export const events = {
  chapter: 'Kapitel Acht',
  overline: 'Events',
  headline: 'Räume für\nbesondere Abende.',
  intro: 'Seit Dezember 2024 richtet das Innsider Firmenevents und private Feiern aus – der Grundstein für viele unvergessliche Momente.',
  cards: [
    { title: 'Firmenevents', body: 'Die ersten erfolgreichen Firmenevents fanden bereits statt – diskret, durchdacht und unvergesslich.' },
    { title: 'Private Feiern', body: 'Geburtstage, Jubiläen und besondere Anlässe im passenden Ambiente.' },
    { title: 'Der ganze Raum', body: 'Für Abende, die den ganzen Raum verdienen – ganz nach Ihren Vorstellungen.' },
  ],
  cta: 'Event anfragen',
} as const

// ── Kapitel 9 — Reservieren ──────────────────────────────────────────────────
export const reservation = {
  chapter: 'Kapitel Neun',
  overline: 'Reservieren',
  headline: 'Wir freuen uns\nauf Sie.',
  sub: 'Reservieren Sie Ihren Abend – wir kümmern uns um den Rest.',
  cta: 'Jetzt reservieren',
  fields: {
    name: 'Ihr Name',
    email: 'E-Mail',
    date: 'Wunschdatum',
    guests: 'Personen',
    occasion: 'Anlass (optional)',
  },
  reassurance: 'Wir antworten persönlich auf jede Anfrage.',
  // Genaue Öffnungszeiten liegen uns nicht vor → ehrlicher Hinweis statt Fantasie.
  hoursNote: 'Frühstück · Mittagstisch · Abend. Aktuelle Öffnungszeiten und Reservierungen gerne telefonisch oder per E-Mail.',
} as const

// Echte Google-Bewertungen (21 Rezensionen).
export const testimonials = {
  overline: 'Gästestimmen',
  count: '21 Google-Bewertungen',
  items: [
    { text: 'Ein hervorragender Koch und überaus zuvorkommende, freundliche Mitarbeiterinnen im Service. Zu den Mittagsmenüs gibt es auch immer ausgezeichnete Suppen. Eine absolute Empfehlung!', author: 'Karin S.' },
    { text: 'Ein Lob an die Küche und das Service! Ausgezeichnetes Essen ist schon super, aber dass dieses noch mit Freundlichkeit serviert wird – brave!', author: 'Lukas P.' },
    { text: 'It’s always a delight to enjoy the ambiance and delicious dishes from the lunch menu, cooked with love and care. Ildiko always makes us feel welcome.', author: 'Bru Eb' },
  ],
} as const

export const footer = {
  line: 'Mehr als ein Restaurant – ein Ort zum Erleben und Erinnern.',
  credit: 'Innsider · Wurmbstraße 36, 1120 Wien · Von Alice Kern.',
} as const
