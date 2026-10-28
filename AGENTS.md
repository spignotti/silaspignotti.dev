# silaspignotti.dev

Personal portfolio at https://silaspignotti.dev. Static Astro site on GitHub Pages.

## Content

This repository is the only source for all site copy: pages in `src/content/pages/`, projects in `src/content/projects/`. There is no Notion mirror, no CMS, and no sync.

- A project is published when its file exists in `src/content/projects/`. Projects that are not on the site have no file here.
- Every change goes through its own branch and a pull request against `main`. CI must be green. Merge only after Silas' OK.
- Drop new screenshots and PDFs in `inbox/`, then `pnpm run process:project-media`.
- No i18n.
- Voice: factual, honest, confident. Projects speak for themselves. Full voice and page-structure rules live in `portfolio-writer`; publish steps live in `site-deploy`.

## Design

Fork of https://github.com/cojocaru-david/portfolio. This repo is the source of truth for current behavior; use the template as a capabilities reference before adding UI.

Keep the site static-first. Add React islands only when a page needs interactivity. Theme is the baseline; v1 is colors, content, and minor layout tweaks.

UI work follows `site-design`. Visual language for graphics, covers, and OG images lives in `docs/style.md`.

## Validation

`pnpm run build` is the commit gate (Node 24 or newer via `verify:node`). Run `pnpm run check` when content schemas, structure, or routes change.

## GitHub

Issues: `spignotti/silaspignotti.dev`
Project: `spignotti/1`
