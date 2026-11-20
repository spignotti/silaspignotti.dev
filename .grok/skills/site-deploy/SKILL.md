---
name: site-deploy
description: >
  Persist and publish silaspignotti.dev pages and projects, including
  screenshots and PDFs. Use when the user asks to change, add, or publish
  website content, or runs /site-deploy.
---

# Site deploy

Markdown and figures only. UI work is `site-design`. Copy drafting is `portfolio-writer`.

## Targets

- Pages: `src/content/pages/landing.md` (`/`), `about.md` (`/about`), `projects.md` (`/projects`)
- Projects: `src/content/projects/<slug>.md`
- Media: `public/projects/<slug>/`

Schema, categories, and `coverIcon` values live in `src/content.config.ts` and `src/lib/project-icons.ts`.

## Persist

1. Infer the target from slug and frontmatter. Ask once if it is ambiguous.
2. Write Markdown with YAML frontmatter. Strip wrappers such as `File target` and fenced frontmatter or body blocks.
3. Write both languages: `src/content/<collection>/de/<slug>.md` and `.../en/<slug>.md`. Figures and images go to `src/assets/figures/<slug>/` as described in `docs/design-spec.md`.

4. Confirm required frontmatter, valid URLs, existing figure paths, and alt text.

Work on a dedicated branch, never directly on `main`. Follow Validation in `AGENTS.md`, then commit the intended files (`content(page): update <route>` or `content(project): upsert <slug>`). Open a pull request against `main` and wait for green CI. Merge only after Silas' OK; the merge to `main` deploys GitHub Pages.

Stop and ask before committing if the change goes beyond markdown and figures.
