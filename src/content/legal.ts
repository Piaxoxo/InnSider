/**
 * Legal content — Impressum & AGB.
 *
 * The text below is the exact legal content supplied for InnSider. It is
 * reproduced verbatim (only structured for readability) — legal clauses are
 * never rewritten, shortened, or invented. The premium layout renders whatever
 * it is given.
 */

export interface LegalRow {
  label: string
  value: string
  href?: string
}
export interface LegalBlock {
  title: string
  rows: LegalRow[]
}
export interface LegalNotice {
  title: string
  body: string
}

export const impressum = {
  route: 'impressum',
  overline: 'Impressum',
  title: 'Die Details\nhinter InnSider.',
  sub: 'Transparenz schafft Vertrauen.',
  intro:
    'Rechtliche Informationen und Offenlegung gemäß §5 ECG, §14 UGB und §25 MedienG.',
  blocks: [
    {
      title: 'Unternehmen',
      rows: [
        { label: 'Restaurant', value: 'InnSider' },
        { label: 'Inhaber / Geschäftsführer', value: 'Gerald Kern' },
      ],
    },
    {
      title: 'Anschrift',
      rows: [
        { label: 'Straße', value: 'Wurmbstraße 36' },
        { label: 'Ort', value: '1120 Wien' },
      ],
    },
    {
      title: 'Kontakt',
      rows: [
        { label: 'Telefon', value: '+43 670 182 9565', href: 'tel:+436701829565' },
        { label: 'E-Mail', value: 'office@innsider.at', href: 'mailto:office@innsider.at' },
        {
          label: 'Webseite',
          value: 'www.innsider-restaurant.at',
          href: 'https://www.innsider-restaurant.at',
        },
      ],
    },
    {
      title: 'Unternehmensangaben',
      rows: [
        { label: 'Unternehmensgegenstand', value: 'Restaurant' },
        { label: 'Wirtschaftskammerzugehörigkeit', value: 'Wirtschaftskammer Wien' },
        { label: 'Aufsichtsbehörde', value: 'Magistrat der Stadt Wien' },
        { label: 'Gerichtsstand', value: 'Landesgericht Wien' },
      ],
    },
  ] as LegalBlock[],
  notices: [
    {
      title: 'Haftungsausschluss',
      body: 'Die Informationen auf dieser Website werden regelmäßig überprüft und aktualisiert. Dennoch übernehmen wir keine Gewähr für die Vollständigkeit, Richtigkeit und Aktualität der Inhalte.',
    },
    {
      title: 'Urheberrecht',
      body: 'Alle Inhalte dieser Website (Texte, Bilder, Grafiken, Logos etc.) sind urheberrechtlich geschützt. Jegliche Nutzung ohne ausdrückliche Zustimmung ist untersagt.',
    },
  ] as LegalNotice[],
} as const

export interface AgbSection {
  id: string
  n: string
  title: string
  paragraphs: string[]
}

export const agb = {
  route: 'agb',
  overline: 'AGB',
  title: 'Klare Vereinbarungen\nfür jeden Gast.',
  sub: 'Allgemeine Geschäftsbedingungen.',
  intro:
    'Die Allgemeinen Geschäftsbedingungen des Restaurants InnSider — verbindlich für alle Leistungen und Angebote.',
  sections: [
    {
      id: 'geltungsbereich',
      n: '1',
      title: 'Geltungsbereich',
      paragraphs: [
        'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen und Angebote des Restaurants InnSider, soweit nicht schriftlich abweichende Vereinbarungen getroffen wurden.',
      ],
    },
    {
      id: 'reservierungen',
      n: '2',
      title: 'Reservierungen',
      paragraphs: [
        'Reservierungen sind telefonisch, per E-Mail oder online möglich und erst nach Bestätigung verbindlich. Stornierungen müssen mindestens 24 Stunden im Voraus erfolgen, andernfalls behalten wir uns vor, eine Ausfallgebühr zu verrechnen.',
      ],
    },
    {
      id: 'veranstaltungen',
      n: '3',
      title: 'Veranstaltungen & Gruppenbuchungen',
      paragraphs: [
        'Für Gruppen ab 10 Personen oder exklusive Events wird eine gesonderte Vereinbarung geschlossen. Anzahlungen oder Mindestumsätze können vereinbart werden. Änderungen der Gästezahl sind spätestens 48 Stunden vor Beginn bekanntzugeben.',
      ],
    },
    {
      id: 'preise',
      n: '4',
      title: 'Preise & Zahlung',
      paragraphs: [
        'Alle Preise verstehen sich in Euro inkl. gesetzlicher MwSt. Die Bezahlung erfolgt in bar oder mit gängigen Bank-/Kreditkarten. Rechnungen sind sofort fällig, sofern nichts anderes vereinbart wurde.',
      ],
    },
    {
      id: 'gutscheine',
      n: '5',
      title: 'Gutscheine',
      paragraphs: [
        'Gutscheine können im Restaurant erworben werden. Eine Barablöse ist nicht möglich.',
      ],
    },
    {
      id: 'haftung',
      n: '6',
      title: 'Haftung',
      paragraphs: [
        'Für Garderobe oder mitgebrachte Gegenstände übernehmen wir keine Haftung, außer bei grober Fahrlässigkeit oder Vorsatz. Für durch Gäste verursachte Schäden haftet der jeweilige Verursacher.',
      ],
    },
    {
      id: 'widerrufsrecht',
      n: '7',
      title: 'Widerrufsrecht',
      paragraphs: [
        'Für Restaurantbesuche und Veranstaltungen im Freizeitbereich besteht kein Widerrufsrecht nach Fern- und Auswärtsgeschäfte-Gesetz.',
      ],
    },
    {
      id: 'datenschutz',
      n: '8',
      title: 'Datenschutz',
      paragraphs: [
        'Personenbezogene Daten werden ausschließlich zur Abwicklung von Reservierungen oder Veranstaltungen verwendet und nicht an Dritte weitergegeben, sofern keine gesetzliche Verpflichtung besteht.',
      ],
    },
    {
      id: 'gerichtsstand',
      n: '9',
      title: 'Gerichtsstand',
      paragraphs: ['Es gilt österreichisches Recht. Gerichtsstand ist Wien.'],
    },
  ] as AgbSection[],
} as const
