# Deployment

- Repo: `NicJMurray/spotify-playlist-finder-v2`
- Purpose: Spotify Playlist Finder app only
- Canonical URL: `https://playlist.njmurray.com`
- Cloudflare type: Pages with Pages Functions
- Cloudflare Pages project: `spotify-playlist-finder-v2`
- Deploy method: Cloudflare Pages Git integration

## Cloudflare settings

- Repository: `NicJMurray/spotify-playlist-finder-v2`
- Production branch: `main`
- Framework preset: `None`
- Build command: leave blank
- Build output directory: `/`
- Custom domain: `playlist.njmurray.com`

## Required Pages environment variables

Configure these in Cloudflare Pages for the API function:

```text
GOOGLE_API_KEY
GOOGLE_CSE_ID
```

## Editing workflow

Edit the repo, commit to `main`, and Cloudflare deploys automatically.

This repo no longer uses a GitHub Actions Wrangler deploy workflow. No `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID` GitHub secrets are needed for Pages deployment.
