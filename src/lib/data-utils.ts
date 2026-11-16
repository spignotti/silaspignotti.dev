import { getCollection, type CollectionEntry } from 'astro:content'
import type { Lang } from '@/i18n'

export async function getPage(lang: Lang, page: CollectionEntry<'pages'>['data']['page']) {
  const entry = (await getCollection('pages')).find((item) => item.data.lang === lang && item.data.page === page)
  if (!entry) throw new Error(`Missing content: pages/${lang}/${page}`)
  return entry
}

export async function getProjects(lang: Lang, kind?: 'case-study' | 'earlier') {
  const all = await getCollection('projects')
  return all
    .filter((item) => item.data.lang === lang && (!kind || item.data.kind === kind))
    .sort((a, b) => a.data.order - b.data.order)
}

export async function getAreas(lang: Lang) {
  const all = await getCollection('areas')
  return all.filter((item) => item.data.lang === lang).sort((a, b) => a.data.order - b.data.order)
}

/** Slugs that exist in both languages, for hreflang and the language switch. */
export async function projectSlugs() {
  const all = await getCollection('projects')
  const de = new Set(all.filter((item) => item.data.lang === 'de').map((item) => item.data.slug))
  const en = new Set(all.filter((item) => item.data.lang === 'en').map((item) => item.data.slug))
  return [...de].filter((slug) => en.has(slug))
}
