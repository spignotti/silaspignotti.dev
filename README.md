# silaspignotti.dev

Personal portfolio website built with Astro.

## What

Professional portfolio showcasing projects as business cases, CV, and contact information.

## Why

Central professional presence for recruiters, freelance clients, and the developer community. Replaces scattered profiles with a single, curated source of truth.

## Tech Stack

- Astro 5.x (static site generator)
- Node.js 24.x (runtime, enforced via `.node-version` and `verify:node`)
- pnpm (package manager)
- TailwindCSS (styling)
- React (interactive islands)
- TypeScript
- Content Collections (type-safe markdown content)
- GitHub Pages (hosting)

## Setup

```bash
# Requires Node 24 (see .node-version; your version manager should switch automatically)
pnpm install

# Start development server (port 3010)
pnpm run dev

# Build for production
pnpm run build

# Run type checking
pnpm run check
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── content/           # Content Collections (pages, projects)
├── layouts/           # Page layouts
├── pages/             # Route-based pages
└── styles/            # Global styles
```

## Content

- **Pages**: Edit markdown files in `src/content/pages/`
- **Projects**: Add markdown files to `src/content/projects/`

Both collections use type-safe schemas defined in `src/content.config.ts`.

## Internal Workflows

Workflows are defined as OpenCode skills and trigger from natural language; no slash commands are needed.

### Content and text

- "Change this text", "add a new project", "update the about page"
- `portfolio-writer` drafts and revises text (voice, structure, facts)
- `site-deploy` persists the content, processes media, validates, commits, and pushes to `main`
- Draft-only requests ("draft a text") stay in chat and are not persisted

### Frontend and design

- "Improve the layout", "make the cards responsive"
- `site-design` implements UI/frontend/config updates using existing local patterns and template lineage, runs SEO/integrity checks, validates, commits, and pushes to `main`

### Security behavior

No always-on security review runs for normal static changes.
The workflows stop and request a security review before committing when work touches security-relevant surfaces (forms/input, API/server handlers, file processing, auth/session, external scripts, redirect/header behavior).

## Deployment

Hosted on GitHub Pages. GitHub Actions validates every push and pull request (`pnpm install --frozen-lockfile`, `check`, `build`); deploys only on pushes to `main`.

## License

MIT
