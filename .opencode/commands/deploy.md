---
description: Unified content deploy for pages, projects, and batch updates
agent: build
---

Deploy the content provided in this chat using one unified workflow.

Command input: `$ARGUMENTS` (optional flags only).

Behavior:

1. Load and run the `site-deploy` skill.
2. Treat pasted chat content as source of truth.
3. Auto-detect deploy scope internally:
   - page update
   - project update
   - batch update
4. Auto-route content to target file paths.
5. Normalize messy Notion markdown exports before writing.
6. Process media only for explicitly provided file mappings (`--file`), never by guessing.
7. Run publish checks and validation, then conventional commit and push.

Supported optional flags:

- `--dry-run`
- `--skip-media`
- `--skip-push`
- `--message "<custom commit message>"`
- `--file "inbox/source.ext -> final-name.ext"` (repeatable)
- `--move`

Safety:

- Never run `pnpm install` in this flow.
- Never run `brew install` in this flow.
- Never mutate global system toolchains in this flow.
- Node 24 required; if not active, stop with the `verify:node` error message.
- Run validation directly via `pnpm run build` (and `pnpm run check` for schema/structural changes).
- Never stage or commit `AGENTS.md` (uncommitted local changes live there).
