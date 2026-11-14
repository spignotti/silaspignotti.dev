export type Site = {
  title: string
  description: string
  href: string
  author: string
  locale: string
  location: string
  email: string
}

export type SocialIcon = 'github' | 'linkedin' | 'email'

export type SocialLink = {
  href: string
  label: string
  icon?: SocialIcon
}
