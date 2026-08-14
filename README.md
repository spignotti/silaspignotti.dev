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

### Content publishing

- `/deploy`

`/deploy` will:

1. detect whether pasted content is a page update, project update, or batch update
2. normalize messy Notion markdown wrappers automatically
3. route content to the correct `src/content/...` destination
4. process media for explicitly provided file mappings (`--file`)
5. run publish checks + validation
6. commit and push to `main`

### Frontend and design work

- `/design`

`/design` will:

1. load frontend design guidance
2. reference existing local patterns and template lineage
3. implement requested UI/frontend/config updates
4. run SEO/integrity checks for touched routes
5. validate
6. commit and push to `main`

### Security behavior

No always-on security review runs for normal static changes.
Security review is triggered only when work touches security-relevant surfaces (forms/input, API/server handlers, file processing, auth/session, external scripts, redirect/header behavior).

## Deployment

Hosted on GitHub Pages. GitHub Actions validates every push and pull request (`pnpm install --frozen-lockfile`, `check`, `build`); deploys only on pushes to `main`.

## License

MIT
