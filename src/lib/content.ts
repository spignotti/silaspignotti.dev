import { getCollection, type CollectionEntry } from 'astro:content'
import type { Lang } from '@/i18n'

export type PageEntry = CollectionEntry<'pages'>
export type AreaEntry = CollectionEntry<'areas'>
export type ProjectEntry = CollectionEntry<'projects'>

export async function getPage(lang: Lang, page: PageEntry['data']['page']): Promise<PageEntry> {
  const pages = await getCollection('pages', (entry) => entry.data.lang === lang && entry.data.page === page)
  const found = pages[0]
  if (!found) throw new Error(`Missing page ${lang}/${page}`)
  return found
}

export async function getAreas(lang: Lang): Promise<AreaEntry[]> {
  const areas = await getCollection('areas', (entry) => entry.data.lang === lang)
  return areas.sort((a, b) => a.data.order - b.data.order)
}

export async function getProjects(lang: Lang): Promise<ProjectEntry[]> {
  const projects = await getCollection('projects', (entry) => entry.data.lang === lang)
  return projects.sort((a, b) => a.data.order - b.data.order)
}

export async function getCases(lang: Lang): Promise<ProjectEntry[]> {
  const projects = await getProjects(lang)
  return projects.filter((project) => project.data.kind === 'case')
}

export async function getCase(lang: Lang, slug: string): Promise<ProjectEntry> {
  const projects = await getCases(lang)
  const found = projects.find((project) => project.data.slug === slug)
  if (!found) throw new Error(`Missing case ${lang}/${slug}`)
  return found
}

export async function getSmallProjects(lang: Lang): Promise<ProjectEntry[]> {
  const projects = await getProjects(lang)
  return projects.filter((project) => project.data.kind === 'small')
}

export async function caseSlugs(): Promise<string[]> {
  const projects = await getCollection('projects', (entry) => entry.data.lang === 'de' && entry.data.kind === 'case')
  return projects.map((project) => project.data.slug).sort()
}
