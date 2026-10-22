# Deployment

| Setting | Value |
| --- | --- |
| Repository | `NicJMurray/spotify-playlist-finder-v2` |
| Production URL | <https://playlist.njmurray.com> |
| Pages project | `spotify-playlist-finder-v2` |
| Production branch | `main` |
| Deploy pipeline | GitHub Actions `.github/workflows/deploy.yml` |
| Build | `npm run build` |
| Public output | `dist/` |
| Backend source | Root `functions/`, compiled separately by Wrangler |

## Publishing status

The pipeline was verified on 23 October 2026 with a successful GitHub Actions deployment to production. It installs the locked npm dependencies, stages public assets, compiles the Functions, and deploys the exact main-branch commit to the existing Pages project.

The workflow targets the known Cloudflare account directly. `CLOUDFLARE_API_TOKEN` is stored as an encrypted GitHub repository secret with Cloudflare Pages Edit permission for that account. Missing credentials cause an explicit failed run rather than a successful skipped deployment.

This project currently uses Direct Upload. GitHub Actions provides automatic publication while retaining the existing project and its encrypted settings. Do not replace it with another Pages project as a deployment workaround.

## Editing workflow

1. Edit the source and update `README.md` if behaviour changes.
2. Run `npm ci`, `npm run build`, and `npm run check:functions`.
3. Commit and push checked changes to `main`.
4. Follow the Actions deployment for that commit and confirm production at <https://playlist.njmurray.com>.

The workflow publishes with `--project-name spotify-playlist-finder-v2 --branch main --commit-hash "$GITHUB_SHA"`. Deployment concurrency prevents simultaneous production uploads.

`npm run dev` builds and serves the public assets with local Pages Functions. `npm start` serves static assets only and cannot run the API.

## Credentials and public assets

Keep the existing production Pages secrets `GOOGLE_API_KEY` and `GOOGLE_CSE_ID` in Cloudflare. Their encrypted values cannot be read back through the API; preserve them when updating deployment configuration. They are runtime Function settings and must never be copied into frontend code or public files. Local development values belong in ignored `.dev.vars`.

`scripts/build.mjs` stages only `index.html`, `styles.css`, and `src/` in ignored `dist/`. Wrangler compiles root `functions/` separately. Backend source, repository docs, package files, local credentials, and dependencies are excluded from public assets.

The curated playlist artwork site at <https://playlists.njmurray.com> belongs to the separate `NicJMurray/playlists` repository.
