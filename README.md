# Spotify Playlist Finder

Source for the standalone Spotify Playlist Finder at `https://playlist.njmurray.com`.

This repo contains only the finder app:

- `index.html`, `styles.css`, and `src/` render the browser UI.
- `functions/api/playlists.js` is the Cloudflare Pages Function that queries Google Custom Search and returns Spotify playlist results.
- `functions/_lib/spotify.js` normalizes and filters Spotify playlist URLs.

The homepage and static Spotify playlist showcase live in separate repos.

## Local development

```sh
npm install
npm run dev
```

For local API testing, copy `.dev.vars.example` to `.dev.vars` and set:

```text
GOOGLE_API_KEY
GOOGLE_CSE_ID
```

## Deployment

This repo should be connected directly to Cloudflare Pages using Cloudflare's Git integration.

Pushing to `main` automatically deploys the app. No GitHub Actions workflow or Cloudflare API secrets are needed for the Pages deployment once it is connected in Cloudflare.

The Cloudflare Pages project still needs these environment variables/secrets for the API function:

```text
GOOGLE_API_KEY
GOOGLE_CSE_ID
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the deployment summary.
