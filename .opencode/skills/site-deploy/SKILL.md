---
name: site-deploy
description: Publishes page and project content for silaspignotti.dev. Load when the user wants to change, add, or publish website content — "ändere diesen Text", "neues Projekt anlegen", "update the about page", "veröffentliche das Projekt". Persists content, processes media, validates, commits, and pushes.
---

# Site Deploy Skill

Publishing contract for all content changes in this repository. Use for **all content persistence**: pages, projects, and media.

## When to use

- The user asks to change, add, or publish page/project content
- `portfolio-writer` hands off an approved text for persistence
- Media files must be moved into `public/projects/`

## Goal

1. infer the target file (page or project)
2. normalize and persist the content
3. process media (screenshots, PDFs)
4. run integrity checks
5. validate
6. commit and push

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

## Step 1 — Infer target

- **Page:** frontmatter `slug` equals `/`, `/about`, `/projects`, or the title clearly indicates one of these pages.
- **Project:** project-shaped keys (`category`, `tags`, ...) or a slug that is not one of the fixed page slugs.
- **Ambiguous:** ask exactly one targeted question.

## Step 2 — Normalize content

- drop wrappers like `File target`, `Frontmatter`, `Body Content`
- if frontmatter is in a fenced code block, extract it as true YAML
- if the body is in fenced markdown, extract only the body
- enforce `.md` output
- remove local/temp references from the final content

## Step 3 — Media processing

Only when the user provides files:

1. Check `inbox/` for new source files
2. For each file run the media script with explicit mappings:

```bash
pnpm run process:project-media -- --slug <slug> --file "inbox/source.png -> screenshot-01.png" --file "inbox/report.pdf -> report.pdf" [--move] [--dry-run]
```

The script moves/copies files into `public/projects/<slug>/` and updates the project's `screenshots`/`downloads` frontmatter. Destination must be a file name only (no nested paths).

## Step 4 — Integrity checks

For touched routes verify:

- required frontmatter keys exist and pass the content schema
- URL fields are valid URLs
- `coverIcon` is one of the valid values listed above
- screenshots have alt text
- no obvious secrets in content
- page/project slugs resolve correctly

## Step 5 — Validation gates

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

## Step 6 — Commit and push

Stage only intended files (never `git add -A` or `git commit -a`).

Commit message defaults:

- page: `content(page): update <route>`
- project: `content(project): upsert <slug>`

Push to `main`. Pushing to `main` triggers the GitHub Pages deploy workflow.

## Security stop gate

No always-on security review for normal content deploys.

**STOP and ask the user** before committing when the change touches:
- form/user-input handling
- API/server route behavior
- file upload/processing logic (beyond the standard media script)
- auth/access control
- external script injection
- redirect/header behavior

## Non-negotiable safety rules

- Never run `pnpm install`
- Never run `brew install`
- Never mutate system Node/pnpm/toolchains
- Never bypass checks without explicit user request
