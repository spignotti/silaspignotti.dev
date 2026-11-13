# silaspignotti.dev

Personal site at https://silaspignotti.dev. Static Astro site on GitHub Pages.

## Content

This repository is the only source for all site copy: pages in `src/content/pages/`, projects in `src/content/projects/`. There is no Notion mirror, no CMS, and no sync.

- A project is published when its file exists in `src/content/projects/`. Projects that are not on the site have no file here.
- Every change goes through its own branch and a pull request against `main`. CI must be green. Merge only after Silas' OK.
- Drop new screenshots and PDFs in `inbox/`, then `pnpm run process:project-media`.
- No i18n.
- Voice: factual, honest, confident. Projects speak for themselves. Full voice and page-structure rules live in `portfolio-writer`; publish steps live in `site-deploy`.

## Stack

Astro 5, Tailwind CSS 4, content collections, GitHub Pages. Static-first. Add a client script only when a page needs it. Do not add React unless a tiny inline script cannot do the job.

Copy lives only in `src/content/`. Visual tokens live in `src/styles/tokens.css` (Personal Brand Guide v1.1, 06.11.2026). Graphics, covers, and OG images follow `docs/style.md`.

## Validation

`pnpm check` validates types and content schemas. `pnpm build` is the commit gate (Node 24 or newer via `verify:node`). Run `pnpm check` when content schemas, structure, or routes change.

## GitHub

Issues: `spignotti/silaspignotti.dev`
Project: `spignotti/1`
