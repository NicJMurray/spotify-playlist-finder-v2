# Spotify Playlist Finder

Source for the standalone Spotify Playlist Finder at `https://playlist.njmurray.com`.

This repo now contains only the finder app:

- `index.html`, `styles.css`, and `src/` render the browser UI.
- `functions/api/playlists.js` is the Cloudflare Pages Function that queries Google Custom Search and returns Spotify playlist results.
- `functions/_lib/spotify.js` normalizes and filters Spotify playlist URLs.

The homepage and static Spotify playlist showcase live in separate repos.

## Local Development

```sh
npm install
npm run dev
```

For local API testing, copy `.dev.vars.example` to `.dev.vars` and set:

```text
GOOGLE_API_KEY
GOOGLE_CSE_ID
```

## Deploy

```sh
npm run deploy
```

Pushing to `main` also deploys through GitHub Actions. See [DEPLOYMENT.md](DEPLOYMENT.md) for the canonical URL, Pages project name, and required secrets.
