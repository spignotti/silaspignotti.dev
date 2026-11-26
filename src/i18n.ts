export const LANGS = ['de', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'de'

export const LANG_NAMES: Record<Lang, string> = { de: 'Deutsch', en: 'English' }
export const HTML_LANG: Record<Lang, string> = { de: 'de', en: 'en' }
export const OG_LOCALE: Record<Lang, string> = { de: 'de_DE', en: 'en_US' }
export const JSON_LANG: Record<Lang, string> = { de: 'de-DE', en: 'en-US' }

export type PageKey = 'home' | 'projects' | 'imprint' | 'privacy'
export type NavKey = 'home' | 'projects'

const PATHS: Record<Lang, Record<PageKey, string>> = {
  de: {
    home: '/',
    projects: '/projekte',
    imprint: '/impressum',
    privacy: '/datenschutz',
  },
  en: {
    home: '/en/',
    projects: '/en/projects',
    imprint: '/en/legal-notice',
    privacy: '/en/privacy',
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

/** Language switch for a bilingual path. A page with no counterpart goes to the other home. */
export function switchPath(lang: Lang, alternate: string | undefined): string {
  if (alternate) return alternate
  return pagePath(otherLang(lang), 'home')
}

export const SECTION_IDS = {
  de: {
    areas: 'bereiche',
    projects: 'projekte',
    about: 'ueber-mich',
    contact: 'kontakt',
  },
  en: {
    areas: 'areas',
    projects: 'projects',
    about: 'about',
    contact: 'contact',
  },
} as const

/** Previous home hashes. The sections moved; these ids still scroll to them. */
export const LEGACY_SECTION_IDS = {
  de: {
    areas: 'arbeitsfelder',
    projects: 'fallstudien',
  },
  en: {
    areas: 'areas-of-work',
    projects: 'case-studies',
  },
} as const

export const UI = {
  de: {
    skip: 'Zum Inhalt springen',
    navLabel: 'Hauptnavigation',
    nav: { home: 'Start', projects: 'Projekte' },
    wordmarkLabel: 'Silas Pignotti, zur Startseite',
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
    proof: 'Projekte',
    figure: 'Abb.',
    shotScroll: 'Abbildung, seitlich verschiebbar',
    placeholder: 'Platzhalter',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundText:
      'Diese Seite gibt es nicht oder nicht mehr. Vielleicht hilft die Startseite oder die Übersicht der Projekte.',
    notFoundHome: 'Zur Startseite',
    notFoundSeo: 'Seite nicht gefunden · Silas Pignotti',
    legalNote: 'Der rechtliche Text folgt.',
  },
  en: {
    skip: 'Skip to content',
    navLabel: 'Main navigation',
    nav: { home: 'Home', projects: 'Projects' },
    wordmarkLabel: 'Silas Pignotti, go to home page',
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
    proof: 'Projects',
    figure: 'Fig.',
    shotScroll: 'Figure, scrolls sideways',
    placeholder: 'Placeholder',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist or no longer exists. The home page or the project overview may help.',
    notFoundHome: 'Go to home page',
    notFoundSeo: 'Page not found · Silas Pignotti',
    legalNote: 'Der rechtliche Text folgt.',
  },
} as const

export type Status = keyof (typeof UI)['de']['statusValue']
