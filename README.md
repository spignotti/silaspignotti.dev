# silaspignotti.dev

Source for [silaspignotti.dev](https://silaspignotti.dev). Copy lives only in `src/content/`.

## Stack

- Astro 5
- Node.js 24 or newer (`verify:node`)
- pnpm
- TypeScript
- Tailwind CSS 4
- Astro content collections
- GitHub Pages

## Commands

```bash
pnpm install
pnpm run dev
pnpm check
pnpm build
```

`pnpm run dev` serves the site on port 3010.

## Content

- Pages: `src/content/pages/`
- Projects: `src/content/projects/`

Schemas are in `src/content.config.ts`. `pnpm check` validates them. A project is published when its Markdown file exists in `src/content/projects/`.

## Analytics

`PUBLIC_POSTHOG_KEY` is unset. The site loads no analytics unless that variable is set at build time. There is no fallback key and no host override. When the key is set, the host is `https://eu.i.posthog.com`. Cookieless pageviews only. No session replay. No autocapture.

## Deployment

Hosted on GitHub Pages. [GitHub Actions](.github/workflows/deploy.yml) runs `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build` on pull requests and on pushes to `main`, then deploys on pushes to `main`.

## License

MIT
