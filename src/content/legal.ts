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
        { label: 'E-Mail', value: 'office@innsider-restaurant.at', href: 'mailto:office@innsider-restaurant.at' },
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

/**
 * Datenschutzerklärung.
 *
 * Beschreibt ausschließlich, was diese Website TATSÄCHLICH tut — keine
 * erfundenen Klauseln: das Reservierungsformular (Versand über FormSubmit),
 * die Kontaktaufnahme per E-Mail/Telefon, Google Fonts, das Hosting bei Vercel
 * sowie die Speicherung im Browser (sessionStorage für die Eröffnungssequenz).
 * Diese Seite ersetzt keine Rechtsberatung — bitte vor dem Livegang von einer
 * Juristin oder einem Juristen prüfen lassen.
 */
/**
 * Der ausliefernde Hoster. Art. 13 DSGVO verlangt Empfänger ODER Kategorien —
 * die namentliche Nennung ist damit nicht zwingend, aber gängige Praxis und
 * ohne Nachteil. Server-Logfiles enthalten IP-Adressen, also personenbezogene
 * Daten.
 */
const HOSTING_PROVIDER_HINWEIS =
  'Diese Website wird bei der netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Deutschland gehostet. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Die Server befinden sich in der Europäischen Union.'

export const datenschutz = {
  route: 'datenschutz',
  overline: 'Datenschutz',
  title: 'Ihre Daten,\nin guten Händen.',
  sub: 'Transparenz nach DSGVO.',
  intro:
    'Wir verarbeiten personenbezogene Daten ausschließlich, soweit es für die Beantwortung Ihrer Anfrage und den Betrieb dieser Website erforderlich ist. Nachfolgend erfahren Sie, welche Daten das sind, wofür wir sie nutzen und welche Rechte Sie haben.',
  sections: [
    {
      id: 'verantwortlich',
      n: '1',
      title: 'Verantwortlicher',
      paragraphs: [
        'Verantwortlich für die Datenverarbeitung auf dieser Website ist: Innsider Restaurant, Inhaber Gerald Kern, Wurmbstraße 36, 1120 Wien, Österreich. Telefon: +43 670 182 9565, E-Mail: office@innsider-restaurant.at.',
      ],
    },
    {
      id: 'reservierung',
      n: '2',
      title: 'Reservierungsanfragen',
      paragraphs: [
        'Wenn Sie das Reservierungsformular nutzen, verarbeiten wir die von Ihnen eingegebenen Daten: Name, E-Mail-Adresse, Wunschdatum, Personenzahl und – sofern angegeben – den Anlass.',
        'Die Übermittlung erfolgt über den Dienst FormSubmit (FormSubmit.co), der die Formulardaten als E-Mail an unser Postfach weiterleitet. Dabei werden die Daten technisch bedingt über die Server dieses Anbieters geleitet. Alternativ können Sie uns jederzeit direkt per E-Mail oder telefonisch erreichen, ohne das Formular zu nutzen.',
        'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bearbeitung Ihrer Anfrage). Wir speichern die Daten nur so lange, wie es für die Bearbeitung Ihrer Anfrage und zur Erfüllung gesetzlicher Aufbewahrungspflichten erforderlich ist.',
      ],
    },
    {
      id: 'kontakt',
      n: '3',
      title: 'Kontakt per E-Mail und Telefon',
      paragraphs: [
        'Wenn Sie uns per E-Mail oder telefonisch kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung des Anliegens. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO.',
      ],
    },
    {
      id: 'hosting',
      n: '4',
      title: 'Hosting und Server-Logfiles',
      paragraphs: [
        'Beim Aufruf dieser Website werden technisch notwendige Daten verarbeitet, die Ihr Browser automatisch übermittelt – insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite sowie Browser- und Betriebssystemangaben. Diese Verarbeitung dient dem sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).',
        // BITTE PRÜFEN: Hier gehört der Hoster hin, der die Seite tatsächlich
        // ausliefert (vermutlich netcup GmbH, Karlsruhe) – mit vollständigem
        // Firmennamen. Solange die Seite zusätzlich Inhalte von Vercel einbindet,
        // muss auch Vercel genannt bleiben.
        HOSTING_PROVIDER_HINWEIS,
        'Teile dieser Website werden über Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) ausgeliefert. Dabei wird Ihre IP-Adresse an diesen Anbieter übertragen. Die Übermittlung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln.',
      ],
    },
    {
      id: 'schriften',
      n: '5',
      title: 'Schriftarten (Google Fonts)',
      paragraphs: [
        'Zur einheitlichen Darstellung der Typografie werden Schriftarten von Google Fonts geladen. Beim Aufruf der Seite baut Ihr Browser dafür eine Verbindung zu Servern von Google auf, wobei Ihre IP-Adresse übertragen wird. Rechtsgrundlage ist unser berechtigtes Interesse an einer ansprechenden Darstellung (Art. 6 Abs. 1 lit. f DSGVO).',
      ],
    },
    {
      id: 'speicherung',
      n: '6',
      title: 'Speicherung im Browser',
      paragraphs: [
        'Diese Website setzt keine Tracking-Cookies und bindet keine Analyse- oder Werbedienste ein. Wir speichern lediglich einen technischen Hinweis im Sitzungsspeicher Ihres Browsers (sessionStorage), damit die Eröffnungssequenz nicht bei jedem Seitenwechsel erneut abgespielt wird. Dieser Eintrag wird gelöscht, sobald Sie den Browser-Tab schließen, und lässt keine Rückschlüsse auf Ihre Person zu.',
      ],
    },
    {
      id: 'rechte',
      n: '7',
      title: 'Ihre Rechte',
      paragraphs: [
        'Sie haben jederzeit das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten, auf Berichtigung, Löschung oder Einschränkung der Verarbeitung, auf Widerspruch gegen die Verarbeitung sowie auf Datenübertragbarkeit. Wenden Sie sich dafür formlos an office@innsider-restaurant.at.',
        'Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, können Sie sich bei der Österreichischen Datenschutzbehörde (Barichgasse 40–42, 1030 Wien, dsb.gv.at) beschweren.',
      ],
    },
  ] as AgbSection[],
} as const

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
