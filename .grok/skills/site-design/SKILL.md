---
name: site-design
description: >
  UI, layout, styling, and visual config for silaspignotti.dev. Use when the
  user asks to improve layout, cards, dark mode, responsiveness, or style, or
  runs /site-design.
---

# Site design

Copy and media publishing belong to `portfolio-writer` and `site-deploy`. Design constraints live in `AGENTS.md`.

Reuse local components and tokens. Respect `prefers-reduced-motion`.

## Checks

On touched routes: one `<h1>`, sensible heading order, `PageHead` still sets title, description, canonical, and Open Graph, images have alt text, internal links resolve.

Then follow Validation in `AGENTS.md`. Commit the intended files (`feat(ui): …` or `fix(ui): …`). Push to `main` to deploy GitHub Pages.

Stop and ask before committing if the change touches forms, server handlers, uploads, auth, embeds, or redirect/header behavior.
