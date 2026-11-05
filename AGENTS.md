# Repository instructions

## Branch and deployment commands

Interpret these natural-language commands (including equivalent phrasing):
- "Работаем в testing": target `testing` for subsequent work in the session.
- "Работаем в main": target `main` for subsequent work in the session.
- "Деплой testing": build, commit relevant changes, push `testing`, monitor the
  Pages workflow, and verify https://o-ants.github.io/portfolio-website/testing/.
- "Деплой main": build, commit relevant changes, push `main`, monitor the Pages
  workflow, and verify https://o-ants.github.io/portfolio-website/.
- "Перенеси testing в main": merge `testing` into `main`, resolve conflicts
  preserving intended changes, validate, push main, and verify production.

Default to `testing` when no branch is specified. Honor the latest explicit
branch selection in the conversation. Report the target before editing. Branch
selection alone is not a request to push; explicit deployment requests authorize
publication. Do not merge testing into main without a user request. Never force
push. Preserve unrelated local changes; use an isolated worktree when necessary.
Fetch and inspect remote branch state before committing or deploying. If access
is unavailable, report the exact remaining step and do not claim deployment.

## Pages architecture

`.github/workflows/deploy-pages.yml` must remain identical on main and testing.
Every push to either branch builds both remote branches into one Pages artifact:
main at `/portfolio-website/`, testing at `/portfolio-website/testing/`.
Keep the shared `github-pages` concurrency group and both build base paths.
The github-pages environment must allow main and testing. Do not change site
content on the other branch just to synchronize deployment configuration.
Use Node 24 and `npm ci`; run `npm run build` before publishing site changes.
For deployment changes, verify both base paths and asset URLs. Use Vite imports
or `import.meta.env.BASE_URL` for assets. Reserve `/testing/` for the preview.
