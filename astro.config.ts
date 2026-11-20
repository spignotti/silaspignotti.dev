import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'static',
  site: 'https://silaspignotti.dev',
  redirects: {
    '/about': '/en/about',
    '/projects': '/en/projects',
    '/projects/routing-engine': '/en/projects/routing-engine-solver',
    '/projects/dispoai': '/en/projects/routing-engine-solver',
    '/projects/master-thesis-uhi': '/en/projects/berlin-lst-downscaling',
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
