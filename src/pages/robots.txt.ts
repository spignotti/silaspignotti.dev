import type { APIRoute } from 'astro'
import { SITE } from '@/consts'

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

# Block access to admin or private directories (if any exist)
Disallow: /api/
Disallow: /temp/

# Sitemap location (single canonical sitemap)
Sitemap: ${sitemapURL.href}

# Additional information
# Host: ${SITE.href}
`

export const GET: APIRoute = ({ site }) => {
  const siteBase = (site?.href ?? SITE.href).endsWith('/') ? (site?.href ?? SITE.href) : `${site?.href ?? SITE.href}/`
  const sitemapURL = new URL('sitemap.xml', siteBase)
  return new Response(getRobotsTxt(sitemapURL))
}
