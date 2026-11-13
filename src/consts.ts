import type { Site, SocialLink } from '@/types'

export const SITE: Site = {
  title: 'Silas Pignotti',
  description: 'Data, geospatial systems, AI, automation, and applied software.',
  href: 'https://silaspignotti.dev',
  author: 'Silas Pignotti',
  locale: 'en-US',
  location: 'Berlin, Germany',
  email: 'pignottisilas@gmail.com',
}

export const NAV_LINKS: SocialLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
]

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://github.com/spignotti', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/silas-pignotti/', label: 'LinkedIn' },
  { href: 'mailto:pignottisilas@gmail.com', label: 'Email' },
]
