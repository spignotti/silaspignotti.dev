import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const lang = z.enum(['de', 'en'])

const link = z.object({ label: z.string(), href: z.string() })

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/pages',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    lang,
    page: z.enum(['home', 'projects', 'about', 'imprint', 'privacy']),
    title: z.string(),
    description: z.string(),
  }),
})

const areas = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/areas',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    lang,
    slug: z.string(),
    order: z.number(),
    title: z.string(),
    summary: z.string(),
    tools: z.string(),
    proof: z.string(),
  }),
})

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    lang,
    slug: z.string(),
    kind: z.enum(['case', 'small']),
    order: z.number(),
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    role: z.string().optional(),
    period: z.string().optional(),
    status: z.enum(['live', 'ongoing', 'completed']).optional(),
    year: z.number().optional(),
    links: z.array(link).default([]),
    keyFigures: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    figures: z
      .array(z.object({ n: z.number(), file: z.string(), caption: z.string() }))
      .default([]),
  }),
})

export const collections = { pages, areas, projects }
