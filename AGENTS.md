# silaspignotti.dev

Personal portfolio at https://silaspignotti.dev. Static Astro site on GitHub Pages.

## Content

Page and project copy is written in Notion (Content-Spiegel) and exported to Markdown whose frontmatter matches `src/content.config.ts`.

- Drop new screenshots and PDFs in `inbox/`, then `pnpm run process:project-media`.
- No CMS. No i18n.
- Voice: factual, honest, confident. Projects speak for themselves. Full voice and page-structure rules live in `portfolio-writer`; publish steps live in `site-deploy`.

Notion page: `52f4ca2e5a3e458cbb425fcc87142015`

## Design

Fork of https://github.com/cojocaru-david/portfolio. This repo is the source of truth for current behavior; use the template as a capabilities reference before adding UI.

Keep the site static-first. Add React islands only when a page needs interactivity. Theme is the baseline; v1 is colors, content, and minor layout tweaks.

UI work follows `site-design`.

## Validation

`pnpm run build` is the commit gate (Node 24 via `verify:node`). Run `pnpm run check` when content schemas, structure, or routes change.

## GitHub

Issues: `spignotti/silaspignotti.dev`
Project: `spignotti/1`
