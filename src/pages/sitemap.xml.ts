import type { APIRoute } from 'astro'
import { SITE } from '@/consts'
import { HTML_LANG, type Lang, pagePath, projectPath } from '@/i18n'
import { caseSlugs } from '@/lib/content'

type Entry = { loc: string; alternates: Partial<Record<Lang | 'x-default', string>> }

export const GET: APIRoute = async () => {
  const abs = (path: string) => new URL(path, SITE.href).href
  const entries: Entry[] = []

  for (const page of ['home', 'projects', 'about'] as const) {
    const alternates = {
      de: abs(pagePath('de', page)),
      en: abs(pagePath('en', page)),
      'x-default': abs(pagePath('de', page)),
    }
    entries.push({ loc: alternates.de, alternates }, { loc: alternates.en, alternates })
  }

  for (const slug of await caseSlugs()) {
    const alternates = {
      de: abs(projectPath('de', slug)),
      en: abs(projectPath('en', slug)),
      'x-default': abs(projectPath('de', slug)),
    }
    entries.push({ loc: alternates.de, alternates }, { loc: alternates.en, alternates })
  }

  // Legal pages are noindex, so they stay out of the sitemap.

  const body = entries
    .map(({ loc, alternates }) => {
      const links = Object.entries(alternates)
        .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang === 'x-default' ? 'x-default' : HTML_LANG[lang as Lang]}" href="${escapeXml(href ?? '')}"/>`)
        .join('\n')
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${links}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char)
}
