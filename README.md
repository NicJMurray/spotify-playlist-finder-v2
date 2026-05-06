# Spotify Playlist Finder

A small Cloudflare Pages app for finding public Spotify playlists that contain a combination of artists or tracks.

Live app: [https://njmurray.com/playlist/](https://njmurray.com/playlist/)

The old URL, [https://playlist.njmurray.com/](https://playlist.njmurray.com/), now redirects to the new path.

## What Is In This Repo

This repo now contains three deployable pieces:

| Path | Purpose | Cloudflare Pages project |
| --- | --- | --- |
| `/` | Original standalone playlist app source. Useful for local development and helper code. | `spotify-playlist-finder-v2` if deployed directly |
| `homepage/` | Source for `njmurray.com`, including the homepage and `/playlist/` app route. | `homepage` |
| `legacy-playlist/` | Keeps `playlist.njmurray.com/api/playlists` alive and redirects all non-API traffic to `/playlist/`. | `spotify-playlist-finder-v2` |

## How The Search Works

1. The browser renders eight search inputs.
2. When submitted, `src/spotify.js` builds a plain quoted query, for example:

   ```txt
   "kanye" "jamie xx"
   ```

3. The `/playlist/` frontend calls:

   ```txt
   /playlist/api/playlists?q=...&limit=10
   ```

4. The `homepage` Pages Function proxies that request to:

   ```txt
   https://playlist.njmurray.com/api/playlists
   ```

5. The legacy API function calls the Google Programmable Search JSON API using `GOOGLE_API_KEY` and `GOOGLE_CSE_ID`.
6. Results are normalized, filtered to real `open.spotify.com/playlist/...` URLs, de-duplicated, and returned to the browser.

The app deliberately does not send `site:open.spotify.com inurl:playlist` from the browser anymore. The custom search engine already handles the Spotify scope better, and adding those operators caused valid playlist results to disappear for searches like `kanye` plus `jamie xx`.

The API still strips those old operators as a fallback, so stale cached clients can recover.

## Google Quota Note

This app uses the Google Custom Search JSON API, not the unlimited embedded Google Search Element. The free JSON API quota is small, so the app is intentionally conservative:

- One Google API request per user search.
- Maximum 10 returned playlist results.
- Successful API responses are cached for 12 hours at the Cloudflare edge.
- Google quota and rate-limit errors are returned to the UI instead of being hidden behind a generic fetch error.

If the UI shows `Google CSE rate limit hit.`, the API quota has already been exhausted or temporarily throttled. Wait for quota reset, raise the quota in Google Cloud, or replace the JSON API with a different search backend.

## Local Development

Install dependencies:

```sh
npm install
```

Run the standalone playlist app:

```sh
npm run dev
```

Run the homepage source, including `/playlist/`:

```sh
npm run dev:homepage
```

Run the legacy playlist project:

```sh
npm run dev:legacy
```

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd`:

```sh
npm.cmd run dev:homepage
```

## Required Cloudflare Secrets

The legacy playlist project needs these production secrets:

```sh
wrangler pages secret put GOOGLE_API_KEY --project-name spotify-playlist-finder-v2
wrangler pages secret put GOOGLE_CSE_ID --project-name spotify-playlist-finder-v2
```

The `homepage` project currently proxies to the legacy API so the Google secrets do not need to be duplicated there.

## Deploying

Deploy the homepage and `/playlist/` route:

```sh
npm run deploy:homepage
```

Deploy the legacy playlist API and redirect:

```sh
npm run deploy:playlist
```

The playlist project uses `playlist` as its production branch in Cloudflare Pages, so the deploy script includes `--branch playlist`.

## Key Files

- `homepage/index.html` - njmurray.com homepage.
- `homepage/playlist/index.html` - `/playlist/` page.
- `homepage/playlist/src/main.js` - browser UI and API fetch flow.
- `homepage/playlist/src/spotify.js` - query building and Spotify URL filtering.
- `homepage/functions/playlist/api/playlists.js` - proxy from `njmurray.com/playlist/api` to the legacy API.
- `legacy-playlist/functions/api/playlists.js` - Google CSE API integration, caching, fallback query cleanup, and playlist filtering.
- `legacy-playlist/functions/_middleware.js` - redirects old subdomain page traffic to `https://njmurray.com/playlist/`.

## Review Notes

Recent fixes included:

- Moved the finder to `https://njmurray.com/playlist/`.
- Redirected `https://playlist.njmurray.com/` to the new route.
- Removed fake sample-result fallback behavior.
- Changed search queries to match how the custom engine performs best.
- Added route-aware API paths.
- Added a legacy API fallback for old over-constrained queries.
- Added CORS headers for the legacy API.
- Reduced Google API usage and added edge caching.
- Updated the homepage and playlist visual theme without adding extra site copy.
