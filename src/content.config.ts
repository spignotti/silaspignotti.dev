import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { PROJECT_CATEGORIES } from '@/lib/project-categories'
import { PROJECT_COVER_ICONS, PROJECT_COVER_ICON_DEFAULT } from '@/lib/project-icons'

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    ogImage: z.string().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      category: z.enum(PROJECT_CATEGORIES),
      tags: z.array(z.string()),
      github: z.string().url().optional(),
      demo: z.string().url().optional(),
      paper: z.string().url().optional(),
      pypi: z.string().url().optional(),
      coverIcon: z.enum(PROJECT_COVER_ICONS).default(PROJECT_COVER_ICON_DEFAULT),
      tagline: z.string().optional(),
      year: z.number().optional(),
      completed: z.boolean().default(true),
      featured: z.boolean().default(false),
      downloads: z
        .array(
          z.object({
            label: z.string(),
            href: z.string().optional(),
            note: z.string().optional(),
          })
        )
        .optional(),
      screenshots: z
        .array(
          z.object({
            src: z.string(),
            alt: z.string(),
          })
        )
        .optional(),
    }),
})

export const collections = { pages, projects }
