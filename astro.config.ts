import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))

/** Old URLs follow the case while it exists, and the project index once the case file is gone. */
function legacyCase(slug: string): string {
  const file = path.join(root, 'src/content/projects/en', `${slug}.md`)
  return fs.existsSync(file) ? `/en/projects/${slug}` : '/en/projects'
}

export default defineConfig({
  output: 'static',
  site: 'https://silaspignotti.dev',
  redirects: {
    '/about': '/en/about',
    '/projects': '/en/projects',
    '/projects/routing-engine': legacyCase('routing-engine-solver'),
    '/projects/dispoai': legacyCase('routing-engine-solver'),
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
