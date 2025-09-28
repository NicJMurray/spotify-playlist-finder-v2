# Spotify Playlist Finder v2 (prototype)

This folder contains a vanilla JavaScript prototype of the Spotify playlist finder UI. It is intentionally lightweight so you can iterate quickly on the front-end while deciding how the backing API should work.

## Getting started

1. Serve the files locally (any static file server works). For convenience, the `package.json` `start` script uses Python:
   ```sh
   npm run start
   ```
   If `npm` is not installed you can call the underlying command directly:
   ```sh
   python3 -m http.server 5173
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.

## How it works

- The page renders eight input fields (matching the Streamlit app).
- Submissions build the same `site:open.spotify.com inurl:playlist` query used in the Python version.
- `fetchPlaylists` expects an `/api/playlists` endpoint that returns `{ results: [...] }`. While the API is under construction, the function falls back to sample data so that the UI remains usable.
- Update `fetchPlaylists` once you have a working backend or decide to call the Google CSE endpoint directly from the browser.

## Next steps

- Wire `fetchPlaylists` to a real API (FastAPI, Cloud Function, etc.).
- Replace the temporary sample data with live results.
- Add automated tests or linting once the stack is defined.

## Deploying to Cloudflare

1. Install Wrangler (`npm install -g wrangler`) if you haven't already.
2. Authenticate via `wrangler login`.
3. Set your Google credentials as secrets:
   ```sh
   wrangler secret put GOOGLE_API_KEY
   wrangler secret put GOOGLE_CSE_ID
   ```
4. Run `wrangler pages dev` (or `wrangler dev`) to test locally.
5. Deploy with `wrangler pages deploy .` for a one-off, or connect the repo in the Cloudflare dashboard to deploy automatically on every GitHub push.

## API proxy

- Pages Function: `functions/api/playlists.js` proxies Google CSE, applies the same normalization/deduping rules, and returns `{ results: [...] }`.
- Helpers live in `functions/_lib/spotify.js`. If you adjust the playlist filters, update both this file and `src/spotify.js`.
