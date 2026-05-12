import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Silas Pignotti',
  description:
    'Geospatial and automation-focused graduate developing spatial analytics, analysis tools, and AI-assisted workflows for urban and infrastructure use cases.',
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
  'Geospatial Data Science': [
    { text: 'Python', logo: 'si:python' },
    { text: 'PyTorch', logo: 'si:pytorch' },
    { text: 'scikit-learn', logo: 'si:scikitlearn' },
    { text: 'Google Earth Engine', logo: 'si:googleearth' },
    { text: 'PostGIS', logo: 'si:postgresql' },
    { text: 'QGIS', logo: 'si:qgis' },
  ],
  'AI & Automation': [
    { text: 'Claude Code', logo: 'lucide:wand-sparkles' },
    { text: 'LLM APIs', logo: 'lucide:sparkles' },
    { text: 'Ollama', logo: 'lucide:bot' },
    { text: 'Notion', logo: 'si:notion' },
  ],
  'Data Engineering & Tooling': [
    { text: 'SQL', logo: 'lucide:database' },
    { text: 'Docker', logo: 'si:docker' },
    { text: 'Git', logo: 'mdi:git' },
    { text: 'Linux', logo: 'lucide:server' },
    { text: 'Google Cloud', logo: 'si:googlecloud' },
    { text: 'Google Colab', logo: 'lucide:file-code' },
    { text: 'FastAPI', logo: 'si:fastapi' },
  ],
}
