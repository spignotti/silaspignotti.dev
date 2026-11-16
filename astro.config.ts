import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import rehypeExternalLinks from 'rehype-external-links'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'static',
  site: 'https://silaspignotti.dev',
  integrations: [mdx()],
  // English pages moved to /en/ when German became the default language.
  redirects: {
    '/about': '/en/about',
    '/projects': '/en/projects',
    '/projects/routing-engine': '/en/projects/routing-engine',
    '/projects/kitamap': '/en/projects/kitamap',
    '/projects/urban-tree-transfer': '/en/projects/urban-tree-transfer',
    '/projects/master-thesis-uhi': '/en/projects/berlin-lst-downscaling',
    '/projects/dispoai': '/en/projects/routing-engine',
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
