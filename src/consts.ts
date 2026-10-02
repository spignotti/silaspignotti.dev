import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Silas Pignotti',
  description:
    'Technical portfolio covering data, geospatial systems, AI, automation, and applied software.',
  href: 'https://silaspignotti.dev',
  author: 'Silas Pignotti',
  locale: 'en-US',
  location: 'Berlin, Germany',
  email: 'pignottisilas@gmail.com'
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/',
    label: 'home',
  },
  {
    href: '/about',
    label: 'about',
  },
  {
    href: '/projects',
    label: 'projects',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/spignotti',
    label: 'GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/silas-pignotti/',
    label: 'LinkedIn',
  },
  {
    href: 'mailto:pignottisilas@gmail.com',
    label: 'Email',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Email: 'lucide:mail',
}

export interface Category {
  text: string
  logo: string
}

export type Technologies = Record<string, Category[]>

export const technologies: Technologies = {
  'Data & Analytics': [
    { text: 'Python', logo: 'si:python' },
    { text: 'SQL', logo: 'lucide:database' },
    { text: 'PostgreSQL', logo: 'si:postgresql' },
    { text: 'scikit-learn', logo: 'si:scikitlearn' },
  ],
  Geospatial: [
    { text: 'QGIS', logo: 'si:qgis' },
    { text: 'PostGIS', logo: 'si:postgresql' },
    { text: 'Google Earth Engine', logo: 'si:googleearth' },
    { text: 'GeoPandas', logo: 'si:geopandas' },
  ],
  'Software & Infrastructure': [
    { text: 'Git', logo: 'mdi:git' },
    { text: 'Docker', logo: 'si:docker' },
    { text: 'FastAPI', logo: 'si:fastapi' },
    { text: 'Google Cloud', logo: 'si:googlecloud' },
  ],
  'AI & Automation': [
    { text: 'n8n', logo: 'lucide:workflow' },
    { text: 'OpenCode', logo: 'lucide:terminal' },
    { text: 'Codex', logo: 'lucide:code' },
    { text: 'OpenRouter', logo: 'lucide:network' },
  ],
}
