export const LANGS = ['de', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'de'

export const HTML_LANG: Record<Lang, string> = { de: 'de', en: 'en' }
export const OG_LOCALE: Record<Lang, string> = { de: 'de_DE', en: 'en_US' }
export const JSON_LANG: Record<Lang, string> = { de: 'de-DE', en: 'en-US' }

export type PageKey = 'home' | 'projects' | 'about' | 'imprint' | 'privacy'
export type NavKey = 'home' | 'projects' | 'about'

const PATHS: Record<Lang, Record<PageKey, string>> = {
  de: {
    home: '/',
    projects: '/projekte',
    about: '/ueber-mich',
    imprint: '/impressum',
    privacy: '/datenschutz',
  },
  en: {
    home: '/en/',
    projects: '/en/projects',
    about: '/en/about',
    imprint: '/impressum',
    privacy: '/datenschutz',
  },
}

export function pagePath(lang: Lang, page: PageKey): string {
  return PATHS[lang][page]
}

export function projectPath(lang: Lang, slug: string): string {
  return `${PATHS[lang].projects}/${slug}`
}

export function otherLang(lang: Lang): Lang {
  return lang === 'de' ? 'en' : 'de'
}

/** Language switch for a bilingual path. Legal pages and the 404 go to the English or German home. */
export function switchPath(lang: Lang, alternate: string | undefined): string {
  if (alternate) return alternate
  return pagePath(otherLang(lang), 'home')
}

export const CASE_ORDER = [
  'routing-engine-solver',
  'routing-engine-agentic',
  'berlin-lst-downscaling',
  'kpi-reference',
] as const

export type CaseSlug = (typeof CASE_ORDER)[number]

export function nextCaseSlug(slug: string): string {
  const i = CASE_ORDER.indexOf(slug as CaseSlug)
  return CASE_ORDER[(i + 1) % CASE_ORDER.length] ?? CASE_ORDER[0]
}

export const SECTION_IDS = {
  de: {
    cases: 'fallstudien',
    areas: 'arbeitsfelder',
    steps: 'so-arbeite-ich',
    contact: 'kontakt',
  },
  en: {
    cases: 'case-studies',
    areas: 'areas-of-work',
    steps: 'how-i-work',
    contact: 'contact',
  },
} as const

export const UI = {
  de: {
    skip: 'Zum Inhalt springen',
    navLabel: 'Hauptnavigation',
    nav: { home: 'Start', projects: 'Projekte', about: 'Über mich' },
    wordmarkLabel: 'Silas Pignotti, zur Startseite',
    switchLang: 'English',
    switchLangLabel: 'Sprache wechseln',
    themeLabel: 'Farbmodus wechseln',
    theme: { light: 'Hell', dark: 'Dunkel', system: 'System' },
    footer: '© 2026 Silas Pignotti · Berlin',
    legalLabel: 'Rechtliches',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    viewProjects: 'Projekte ansehen',
    readCase: 'Fallstudie lesen',
    allProjects: 'Alle Projekte',
    nextCase: 'Nächste Fallstudie',
    back: 'Zurück zu den Projekten',
    role: 'Rolle',
    period: 'Zeitraum',
    status: 'Stand',
    links: 'Links',
    keyFigures: 'Kennzahlen',
    statusValue: { live: 'live', ongoing: 'laufend', completed: 'abgeschlossen' },
    tools: 'Werkzeuge',
    proof: 'Beleg',
    figure: 'Abb.',
    moreAbout: 'Mehr über mich',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundText:
      'Diese Seite gibt es nicht oder nicht mehr. Vielleicht hilft die Startseite oder die Übersicht der Projekte.',
    notFoundHome: 'Zur Startseite',
    notFoundSeo: 'Seite nicht gefunden · Silas Pignotti',
    legalNote: 'Der rechtliche Text folgt.',
    homeFigureLabel: { 'routing-engine-agentic': 'gemergte Pull Requests' },
  },
  en: {
    skip: 'Skip to content',
    navLabel: 'Main navigation',
    nav: { home: 'Home', projects: 'Projects', about: 'About' },
    wordmarkLabel: 'Silas Pignotti, go to home page',
    switchLang: 'Deutsch',
    switchLangLabel: 'Change language',
    themeLabel: 'Change colour mode',
    theme: { light: 'Light', dark: 'Dark', system: 'System' },
    footer: '© 2026 Silas Pignotti · Berlin',
    legalLabel: 'Legal',
    imprint: 'Legal notice',
    privacy: 'Privacy',
    viewProjects: 'View projects',
    readCase: 'Read case study',
    allProjects: 'All projects',
    nextCase: 'Next case study',
    back: 'Back to projects',
    role: 'Role',
    period: 'Period',
    status: 'Status',
    links: 'Links',
    keyFigures: 'Key figures',
    statusValue: { live: 'live', ongoing: 'ongoing', completed: 'completed' },
    tools: 'Tools',
    proof: 'Evidence',
    figure: 'Fig.',
    moreAbout: 'More about me',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist or no longer exists. The home page or the project overview may help.',
    notFoundHome: 'Go to home page',
    notFoundSeo: 'Page not found · Silas Pignotti',
    legalNote: 'Der rechtliche Text folgt.',
    homeFigureLabel: { 'routing-engine-agentic': 'merged pull requests' },
  },
} as const

export type Status = keyof (typeof UI)['de']['statusValue']
