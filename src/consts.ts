import type { Site, SocialLink } from '@/types'

export const SITE: Site = {
  title: 'Silas Pignotti',
  description: 'Silas Pignotti, Berlin.',
  href: 'https://silaspignotti.dev',
  author: 'Silas Pignotti',
  locale: 'de-DE',
  location: 'Berlin, Germany',
  email: 'pignottisilas@gmail.com',
}

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://github.com/spignotti', label: 'GitHub', icon: 'github' },
  { href: 'https://www.linkedin.com/in/silas-pignotti/', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'mailto:pignottisilas@gmail.com', label: 'Email', icon: 'email' },
]
