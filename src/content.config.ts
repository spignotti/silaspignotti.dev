import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const lang = z.enum(['de', 'en'])

const link = z.object({ label: z.string(), href: z.string() })

// One file per page and language: src/content/pages/<lang>/<page>.md
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    lang,
    page: z.enum(['home', 'projects', 'about', 'imprint', 'privacy']),
    title: z.string(),
    description: z.string().max(155),
    hero: z
      .object({
        eyebrow: z.string(),
        heading: z.string(),
        lead: z.string(),
        facts: z.string(),
        primaryAction: z.string(),
      })
      .optional(),
    intro: z.string().optional(),
    contact: z.object({ heading: z.string(), text: z.string() }).optional(),
    timeline: z
      .array(z.object({ years: z.string(), role: z.string(), org: z.string(), text: z.string() }))
      .optional(),
    education: z
      .array(z.object({ years: z.string(), degree: z.string(), school: z.string(), note: z.string().optional() }))
      .optional(),
  }),
})

// Capability areas, one file per area and language: src/content/areas/<lang>/<slug>.md
// A later offer page can render the same entries.
const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    lang,
    order: z.number(),
    title: z.string(),
    summary: z.string(),
    tools: z.array(z.string()).max(4),
    proof: z.array(z.string()).min(1),
  }),
})

// Case studies and earlier work, one file per project and language:
// src/content/projects/<lang>/<slug>.mdx
const projects = defineCollection({
  // The id is the file path (de/<slug>), so the same slug can exist in both languages.
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    lang,
    slug: z.string(),
    kind: z.enum(['case-study', 'earlier']),
    order: z.number(),
    title: z.string(),
    summary: z.string().max(155),
    role: z.string(),
    period: z.string(),
    status: z.enum(['live', 'in-progress', 'completed']),
    links: z.array(link).default([]),
    keyFigures: z.array(z.object({ value: z.string(), label: z.string() })).max(3).default([]),
    cover: z.object({ figure: z.string().optional(), src: z.string().optional(), alt: z.string() }).optional(),
    screenshots: z.array(z.object({ src: z.string(), alt: z.string() })).optional(),
    downloads: z.array(link).optional(),
  }),
})

export const collections = { pages, areas, projects }
