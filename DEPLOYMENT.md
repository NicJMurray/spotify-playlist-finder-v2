# Deployment

- Repo: `NicJMurray/spotify-playlist-finder-v2`
- Purpose: Spotify Playlist Finder app only
- Canonical URL: `https://playlist.njmurray.com`
- Cloudflare type: Pages with Pages Functions
- Cloudflare Pages project: `spotify-playlist-finder-v2`
- Deploy command: `npm run deploy`
- Wrangler command: `wrangler pages deploy . --project-name spotify-playlist-finder-v2 --branch main`

## GitHub Actions

Pushing to `main` deploys through `.github/workflows/deploy.yml`.

Required repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The app also needs Google CSE credentials configured in Cloudflare Pages environment variables/secrets:

```text
GOOGLE_API_KEY
GOOGLE_CSE_ID
```

The Pages project may still show "No Git connection" in Cloudflare. That is fine when GitHub Actions deploys with Wrangler.
