import type { APIRoute } from 'astro'
import { SITE } from '@/consts'
import { HTML_LANG, type Lang, pagePath, projectPath } from '@/i18n'
import { getProjects, projectSlugs } from '@/lib/data-utils'

type Entry = { loc: string; alternates: Partial<Record<Lang, string>> }

export const GET: APIRoute = async () => {
  const base = SITE.href.replace(/\/$/, '')
  const abs = (path: string) => `${base}${path === '/' ? '/' : `${path}/`}`
  const entries: Entry[] = []

  for (const page of ['home', 'projects', 'about'] as const) {
    const alternates = { de: abs(pagePath('de', page)), en: abs(pagePath('en', page)) }
    entries.push({ loc: alternates.de, alternates }, { loc: alternates.en, alternates })
  }

  const both = new Set(await projectSlugs())
  for (const lang of ['de', 'en'] as const) {
    for (const project of await getProjects(lang)) {
      const slug = project.data.slug
      const alternates = both.has(slug)
        ? { de: abs(projectPath('de', slug)), en: abs(projectPath('en', slug)) }
        : { [lang]: abs(projectPath(lang, slug)) }
      entries.push({ loc: abs(projectPath(lang, slug)), alternates })
    }
  }

  entries.push({ loc: abs('/impressum'), alternates: {} }, { loc: abs('/datenschutz'), alternates: {} })

  const body = entries
    .map(({ loc, alternates }) => {
      const links = Object.entries(alternates)
        .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${HTML_LANG[lang as Lang]}" href="${escapeXml(href!)}"/>`)
        .join('\n')
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${links ? `\n${links}` : ''}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' },
  })
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)
}
