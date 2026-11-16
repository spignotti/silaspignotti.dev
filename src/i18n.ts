export const LANGS = ['de', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'de'

export const HTML_LANG: Record<Lang, string> = { de: 'de-DE', en: 'en-US' }
export const OG_LOCALE: Record<Lang, string> = { de: 'de_DE', en: 'en_US' }

type PageKey = 'home' | 'projects' | 'about' | 'imprint' | 'privacy'

const PATHS: Record<Lang, Record<PageKey, string>> = {
  de: {
    home: '/',
    projects: '/projekte',
    about: '/ueber-mich',
    imprint: '/impressum',
    privacy: '/datenschutz',
  },
  en: {
    home: '/en',
    projects: '/en/projects',
    about: '/en/about',
    // Legal pages exist in German only.
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

export const UI = {
  de: {
    skip: 'Zum Inhalt',
    nav: { home: 'Start', projects: 'Projekte', about: 'Über mich' },
    menuOpen: 'Menü',
    menuClose: 'Schließen',
    themeToLight: 'Zum hellen Modus wechseln',
    themeToDark: 'Zum dunklen Modus wechseln',
    switchLang: 'English',
    switchLangLabel: 'Diese Seite auf Englisch',
    caseStudies: 'Fallstudien',
    areas: 'Woran ich arbeite',
    earlier: 'Frühere Arbeiten',
    contact: 'Kontakt',
    email: 'E-Mail',
    proof: 'Beleg',
    role: 'Rolle',
    period: 'Zeitraum',
    status: { live: 'live', 'in-progress': 'laufend', completed: 'abgeschlossen' },
    next: 'Nächste Fallstudie',
    allProjects: 'Alle Projekte',
    timeline: 'Stationen',
    education: 'Ausbildung',
    figure: 'Abb.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    placeholder: 'Platzhalter',
  },
  en: {
    skip: 'Skip to content',
    nav: { home: 'Home', projects: 'Projects', about: 'About' },
    menuOpen: 'Menu',
    menuClose: 'Close',
    themeToLight: 'Switch to light theme',
    themeToDark: 'Switch to dark theme',
    switchLang: 'Deutsch',
    switchLangLabel: 'This page in German',
    caseStudies: 'Case studies',
    areas: 'What I work on',
    earlier: 'Earlier work',
    contact: 'Contact',
    email: 'Email',
    proof: 'Case',
    role: 'Role',
    period: 'Period',
    status: { live: 'live', 'in-progress': 'in progress', completed: 'completed' },
    next: 'Next case study',
    allProjects: 'All projects',
    timeline: 'Experience',
    education: 'Education',
    figure: 'Fig.',
    imprint: 'Imprint',
    privacy: 'Privacy',
    placeholder: 'Placeholder',
  },
} as const

/** Copy that is not written yet is wrapped in square brackets in the content files. */
export function isPlaceholder(text: string | undefined): boolean {
  if (!text) return false
  const trimmed = text.trim()
  return trimmed.startsWith('[') && trimmed.endsWith(']')
}
