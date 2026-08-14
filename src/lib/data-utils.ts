import { getCollection, type CollectionEntry } from 'astro:content'

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects
    .sort((a, b) => {
      const aYear = a.data.year ?? 0
      const bYear = b.data.year ?? 0
      if (bYear !== aYear) {
        return bYear - aYear
      }
      const aOngoing = a.data.completed ? 1 : 0
      const bOngoing = b.data.completed ? 1 : 0
      return aOngoing - bOngoing
    })
}
