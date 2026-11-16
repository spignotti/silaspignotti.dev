# silaspignotti.dev

Personal site at https://silaspignotti.dev. Static Astro site on GitHub Pages.

## Content

This repository is the only source for all site copy. There is no Notion mirror, no CMS, and no sync.

- German at `/`, English at `/en/`. Every page exists in both languages: `src/content/pages/<lang>/`, `src/content/areas/<lang>/`, `src/content/projects/<lang>/<slug>.mdx` with the same slug in both. UI strings and routes live in `src/i18n.ts`. Imprint and privacy are German only.
- A project is published when its file exists in `src/content/projects/<lang>/`. Projects that are not on the site have no file here.
- Copy that is not written yet stays in square brackets (frontmatter) or in `<Placeholder>` (MDX). Both render visibly marked.
- Case studies follow the template in the content concept (Silas' notes `website-konzept.md`): role, period, status, up to three key figures, then Problem / Approach / System / Result / Limits. No package badges.
- Every change goes through its own branch and a pull request against `main`. CI must be green. Merge only after Silas' OK.
- Drop new screenshots and PDFs in `inbox/`, then `pnpm run process:project-media`.
- Voice: factual, honest, calm. No services list, no availability claim. Never the word portfolio.

## Stack

Astro 5, Tailwind CSS 4, content collections, GitHub Pages. Static-first. Add a client script only when a page needs it. Do not add React unless a tiny inline script cannot do the job.

Copy lives only in `src/content/`. Visual tokens live in `src/styles/tokens.css` (Personal Brand Guide v1.1, 06.11.2026). Graphics, covers, and OG images follow `docs/style.md`.

## Validation

`pnpm check` validates types and content schemas. `pnpm build` is the commit gate (Node 24 or newer via `verify:node`). Run `pnpm check` when content schemas, structure, or routes change.

## GitHub

Issues: `spignotti/silaspignotti.dev`
Project: `spignotti/1`
