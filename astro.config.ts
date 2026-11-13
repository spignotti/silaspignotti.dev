import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'

import expressiveCode from 'astro-expressive-code'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeExternalLinks from 'rehype-external-links'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'
import remarkSectionize from 'remark-sectionize'

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'static',
  site: 'https://silaspignotti.dev',
  redirects: {
    '/projects/dispoai': '/projects/routing-engine',
  },

  integrations: [
    expressiveCode({
      themes: ['catppuccin-latte', 'ayu-dark'],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      defaultProps: {
        wrap: true,
        collapseStyle: 'collapsible-auto',
        overridesByLang: {
          'ansi,bat,bash,batch,cmd,console,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,text,zsh':
            {
              showLineNumbers: true,
            },
        },
      },
    }),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  devToolbar: {
    enabled: false,
  },

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          ariaLabel: 'External link',
        },
      ],
      rehypeHeadingIds,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'catppuccin-latte',
            dark: 'ayu-dark',
          },
        },
      ],
    ],
    remarkPlugins: [remarkMath, remarkEmoji, remarkSectionize],
  },
})
