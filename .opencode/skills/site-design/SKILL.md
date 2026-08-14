---
name: site-design
description: Frontend, design, layout, and visual config work for silaspignotti.dev. Load when the user asks to improve the UI, layout, styling, or responsive behavior — "Layout verbessern", "Cards anpassen", "Dark Mode", "responsive", "Stil ändern". Implements UI changes, validates SEO/integrity, commits, and pushes.
---

# Site Design Skill

Frontend/design/config workflow for this repository.

## When to use

- The user asks for UI, frontend, layout, styling, responsive, interaction, or visual config changes
- Not for content publishing — that is the `site-deploy` skill's job

## Required workflow

1. Load the `frontend-design` skill first.
2. Read 3-5 relevant files in the affected area before editing.
3. Preserve existing local design system conventions first.
4. Reference base template capabilities:
   - https://github.com/cojocaru-david/portfolio
   - borrow established patterns before introducing custom abstractions.

## Change scope

Typical design work includes:

- page layout and hierarchy improvements
- card/component visual polish
- responsive behavior improvements
- interaction and animation tuning (respect reduced motion)
- frontend presentation config related to visuals, metadata handoff, or UX polish

Avoid scope bleed into content-persistence logic (that belongs to the `site-deploy` skill).

## SEO and integrity checks (always)

For touched routes/components verify:

- exactly one `<h1>` per page
- heading hierarchy remains sensible
- `PageHead` integration remains intact (title/description/canonical/og)
- image alt text remains present
- internal links still resolve
- no accidental route/base-path regressions

## Security stop gate

No always-on security review for normal static visual changes.

**STOP and ask the user** before committing when the change touches security-relevant surface:
- user input/forms handling
- API endpoints/server handlers
- file upload/processing logic
- auth/session/access control
- external script/embed injection
- redirect/header/cookie/security policy behavior

## Validation gates

Always run the build gate:

```bash
pnpm run build
```

Run the check gate for structural or larger frontend/config changes:

```bash
pnpm run check
```

If a gate fails: stop, report, do not commit. Do not bypass the gates.

## Commit and push

Stage only intended files (never `git add -A` or `git commit -a`).

Commit message defaults:

- `feat(ui): implement requested design updates`
- `fix(ui): polish layout and responsiveness`
- `chore(ui): adjust frontend config and seo checks`

Push to `main`. Pushing to `main` triggers the GitHub Pages deploy workflow.

## Non-negotiable safety rules

- Never run `pnpm install` in this workflow
- Never run `brew install` in this workflow
- Never mutate system Node/pnpm/toolchains in this workflow
- Never bypass checks without explicit user request
