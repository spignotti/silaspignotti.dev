import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))

/** Old URLs follow the case while it exists, and the project index once the case file is gone. */
function legacyCase(slug: string, lang: 'de' | 'en' = 'en'): string {
  const file = path.join(root, 'src/content/projects', lang, `${slug}.md`)
  const base = lang === 'de' ? '/projekte' : '/en/projects'
  return fs.existsSync(file) ? `${base}/${slug}` : base
}

export default defineConfig({
  output: 'static',
  site: 'https://silaspignotti.dev',
  redirects: {
    '/about': '/en/#about',
    '/ueber-mich': '/#ueber-mich',
    '/en/about': '/en/#about',
    '/projects': '/en/projects',
    '/projects/routing-engine': legacyCase('tourengenie'),
    '/projects/dispoai': legacyCase('tourengenie'),
    '/projekte/routing-engine-solver': legacyCase('tourengenie', 'de'),
    '/projekte/routing-engine-agentic': legacyCase('tourengenie', 'de'),
    '/en/projects/routing-engine-solver': legacyCase('tourengenie'),
    '/en/projects/routing-engine-agentic': legacyCase('tourengenie'),
    '/projects/master-thesis-uhi': legacyCase('berlin-lst-downscaling'),
    '/projects/urban-tree-transfer': '/en/projects',
    '/projects/kitamap': '/en/projects',
    '/projects/urbaniq': '/en/projects',
    '/projects/litresearch': '/en/projects',
    '/projects/opencode-workflow-kit': '/en/projects',
    '/projects/para-pm-system': '/en/projects',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  devToolbar: {
    enabled: false,
  },

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          ariaLabel: 'External link',
        },
      ],
    ],
  },
})
