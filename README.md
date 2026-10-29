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

In the repository's **Settings → Pages**, select **GitHub Actions** as the source.
The `Deploy portfolio to GitHub Pages` workflow builds and deploys every push to
`main`; it can also be started manually from the Actions tab. The build uses the
base path reported by GitHub Pages so assets work under the repository URL.

The default site URL is https://o-ants.github.io/portfolio-website/.
The first deployment must finish successfully before the site is available.
