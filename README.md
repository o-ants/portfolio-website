# Portfolio Website

Personal portfolio of a Product Designer.

## Development

Requires Node.js 22.12+ (Node.js 24 is supported) and npm.

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The build runs TypeScript checks and creates the production site in `dist/`.
The starter uses React, Vite, and TypeScript. Edit `src/App.tsx` for page content
and `src/style.css` for styles. Case studies currently use a coming-soon placeholder.

## GitHub Pages

Source: **Settings → Pages → GitHub Actions**.

- `main`: https://o-ants.github.io/portfolio-website/
- `testing`: https://o-ants.github.io/portfolio-website/testing/

Every push to either branch builds the latest versions of **both** branches and
publishes one combined Pages artifact. A failed build leaves the published site
unchanged. Both versions are public. Workflows must stay synchronized on both
branches. The `github-pages` environment must permit deployments from both
`main` and `testing`.

Vite receives the correct base path during each build. Use imported assets or
`import.meta.env.BASE_URL` for public assets; avoid hardcoded root asset paths.
The `/testing/` path is reserved for the testing site.

## Commands for the assistant

Instructions are stored in `AGENTS.md` and apply to future sessions in this repo.

- «Работаем в testing» — make subsequent changes on `testing`.
- «Работаем в main» — make subsequent changes on `main`.
- «Деплой testing» — validate and publish the testing branch.
- «Деплой main» — validate and publish the main branch.
- «Перенеси testing в main» — merge testing into main and publish production.

Without an explicit target, use `testing`. Selecting a branch alone does not
publish changes; an explicit deployment request authorizes pushing that branch.
Each push rebuilds both sites, but does not merge their source code.
