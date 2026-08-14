---
name: site-deploy
description: Unified portfolio deployment workflow. Auto-detect page/project content, process media, run SEO checks, validate, then commit and push.
---

# Site Deploy Skill

Use this skill for **all content publishing** in this repository.

Single entrypoint: `/deploy`

## Goal

Given content in chat, handle the complete publish workflow end-to-end:

1. infer content type (page/project)
2. normalize and route to correct files
3. process media (screenshots, PDFs)
4. run SEO/integrity checks
5. validate
6. commit and push

## Inputs

- Primary input: content pasted in chat
- Optional command flags:
  - `--dry-run`
  - `--skip-media`
  - `--skip-push`
  - `--message "..."`
  - `--file "inbox/source.png -> screenshot-01.png"` (repeatable)
  - `--move`

## Repository contracts

### Pages

- `src/content/pages/landing.md` (slug: `/`)
- `src/content/pages/about.md` (slug: `/about`)
- `src/content/pages/projects.md` (slug: `/projects`)

### Projects

- `src/content/projects/<slug>.md`

### Project schema (source of truth: `src/content.config.ts`)

Required:

```yaml
title: "Project Name"
slug: "project-slug"
description: "Brief description for SEO and cards"
category: "Geospatial" | "AI/Automation"
tags: ["Tag1", "Tag2", ...]
```

Optional:

```yaml
github: "https://github.com/..."
tagline: "Short tagline for project cards"
demo: "https://demo-url.com"
paper: "https://paper-url.com"
pypi: "https://pypi.org/project/..."
year: 2025
completed: true        # default: true
featured: false        # default: false
coverIcon: "terminal"  # default: layers
downloads:
  - label: "Download Label"
    href: "/path/to/file.pdf"
screenshots:
  - src: "/projects/slug/screenshot.png"
    alt: "Description of screenshot"
```

### Valid coverIcon values

`layers`, `terminal`, `satellite`, `map-pin`, `file-search`, `layout-dashboard`, `wand-2`, `trees`, `building-2`, `book-open-check`, `workflow`

Default when omitted: `layers`. Any other value fails the content-schema build.

### Published media

- Project screenshots: `public/projects/<slug>/<files>`
- All media referenced in frontmatter must exist at the specified path

## Phase 1 — Infer scope

1. **Page deploy**
   - frontmatter `slug` equals `/`, `/about`, `/projects`
   - or title indicates one of these pages
2. **Project deploy**
   - project-shaped keys (`category`, `tags`, ...)
   - or slug is not one of the fixed page slugs
3. **Ambiguous**
   - ask exactly one targeted question

## Phase 2 — Normalize content

- drop wrappers like `File target`, `Frontmatter`, `Body Content`
- if frontmatter in fenced code block, extract as true YAML
- if body in fenced markdown, extract only body
- enforce `.md` output
- remove local/temp references from final content

## Phase 3 — Media processing

Only when files are provided and `--skip-media` is not set:

1. Check `inbox/` for new source files
2. For each file run the existing media script with explicit mappings:

```bash
pnpm run process:project-media -- --slug <slug> --file "inbox/source.png -> screenshot-01.png" --file "inbox/report.pdf -> report.pdf" [--move] [--dry-run]
```

The script moves/copies files into `public/projects/<slug>/` and updates the project's `screenshots`/`downloads` frontmatter. Destination must be a file name only (no nested paths).

## Phase 4 — Publish integrity checks

For touched routes verify:

- required frontmatter keys exist and pass the content schema
- URL fields are valid URLs
- `coverIcon` is one of the valid values listed above
- screenshots have alt text
- no obvious secrets in content
- page/project slugs resolve correctly

### Conditional security review

Do **not** run for normal content deploys.

Trigger `security-review` only when changes touch:
- form/user-input handling
- API/server route behavior
- file upload/processing logic (beyond the standard media script)
- auth/access control
- external script injection
- redirect/header behavior

## Phase 5 — Validation gates

Node 24 is the project standard (`verify:node` gates `build`/`check`). If the active Node is not 24, stop with the script's error message — never install or mutate a toolchain.

Always run the build gate:

```bash
pnpm run build
```

Run the check gate for schema-sensitive or structural changes (new project, schema field, category/icon changes):

```bash
pnpm run check
```

If any gate fails: stop, report, do not commit.

## Phase 6 — Commit and push

Stage only intended files (never `git add -A` or `git commit -a`).

Commit message defaults:

- page: `content(page): update <route>`
- project: `content(project): upsert <slug>`

Push to `main` unless `--skip-push`. Pushing to `main` triggers the GitHub Pages deploy workflow.

## Non-negotiable safety rules

- Never run `pnpm install`
- Never run `brew install`
- Never mutate system Node/pnpm/toolchains
- Never bypass checks without explicit request
- Never stage `AGENTS.md` (it carries uncommitted local changes)
