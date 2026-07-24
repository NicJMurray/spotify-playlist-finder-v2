# Spotify Playlist Finder

Personal search tool at `playlist.njmurray.com`. It finds public Spotify playlists that contain one or more supplied artists, tracks, or other terms.

## How a search works

1. `src/main.js` creates the eight search fields and turns the non-empty entries into one quoted Google query. For example, `Jamie xx` and `Starburster` becomes `"Jamie xx" "Starburster"`.
2. The browser requests `GET /api/playlists?q=…&limit=10` from the Cloudflare Pages Function in `functions/api/playlists.js`.
3. The function asks Google Custom Search for the query, using its server-side API key and search-engine ID. It makes at most one page request and returns at most ten results.
4. If the original query contains Google-style Spotify operators such as `site:open.spotify.com`, the function retries once without them. This prevents an over-specific user query from returning nothing unnecessarily.
5. `functions/_lib/spotify.js` removes Google redirect wrappers, accepts only `open.spotify.com/playlist/...` URLs, converts embed URLs to normal playlist URLs, removes tracking parameters, and de-duplicates results.
6. The browser validates the returned results again, optionally removes titles containing “radio”, and renders the result cards.

Google results are cached at Cloudflare for 12 hours per normalised query and result limit. The app does not use the Spotify API: it can only find playlists that Google has indexed.

## Code map

| File | Responsibility |
| --- | --- |
| `index.html` | Page structure, result template, and `data-api-base` configuration. |
| `styles.css` | All visual styling. |
| `src/main.js` | Form behaviour, API request, loading/error states, client-side filter, and result rendering. |
| `src/spotify.js` | Browser copy of the query builder and Spotify-result normaliser. |
| `functions/api/playlists.js` | Server-side search endpoint, CORS rules, validation, Google request, and cache. |
| `functions/_lib/spotify.js` | Server-side URL normalisation, playlist filtering, and de-duplication. |

`src/spotify.js` and `functions/_lib/spotify.js` intentionally contain equivalent URL-filtering logic: the function keeps invalid results out of the response, while the browser remains defensive if the endpoint is ever changed.

## Things worth changing

- Change the example search fields in `placeholders` in `src/main.js`.
- Change the result cap by updating `RESULT_LIMIT` in the browser and the matching limits in `functions/api/playlists.js`.
- Change the “exclude radio” rule in `applyFilters()` in `src/main.js`.
- If this is served from another domain, add it to `ALLOWED_ORIGINS` in the function; otherwise browser requests from that domain will not receive CORS permission.

The production function relies on `GOOGLE_API_KEY` and `GOOGLE_CSE_ID`. They are deliberately only read in the server-side function, never exposed to the browser.
