# njmurray.com Homepage And Playlist Finder

Source for the `njmurray.com` homepage and the Spotify Playlist Finder at:

- `https://njmurray.com/`
- `https://njmurray.com/playlist/`

The homepage also links to separate project pages, including Books, Rare Word Explorer, and Spotify Playlists.

## What Is In This Repo

| Path | Purpose |
| --- | --- |
| `homepage/` | Cloudflare Pages source for `njmurray.com`. This is the production site. |
| `homepage/index.html` | Homepage with Music and Literature project groups. |
| `homepage/playlist/` | The Spotify Playlist Finder frontend served at `/playlist/`. |
| `homepage/playlists/` | Static playlist gallery served at `/playlists/`. The canonical source for that page is also published in the separate `NicJMurray/playlists` repo. |
| `homepage/functions/playlist/api/playlists.js` | Pages Function that forwards finder API requests to the existing playlist-search API endpoint. |
| `src/`, `functions/`, root `index.html`, root `styles.css` | Standalone finder source kept for local reference and experiments. |

Old unused subprojects have been removed so the repository reflects the current Cloudflare Pages setup.

## How The Homepage Works

The homepage is a static HTML page with inline CSS. It keeps the navigation deliberately simple:

- Music: `Spotify Playlist Finder` and `Spotify Playlists`
- Literature: `Reading List` and `Rare Word Explorer`

Cloudflare Pages serves `homepage/index.html` at `https://njmurray.com/`. The `_redirects` file normalizes extensionless paths like `/playlist` and `/gutenberg` to trailing-slash routes.

## How The Playlist Finder Works

1. The browser renders eight search inputs from `homepage/playlist/src/main.js`.
2. `homepage/playlist/src/spotify.js` turns non-empty terms into a quoted search query.
3. The frontend calls `/playlist/api/playlists?q=...&limit=10`.
4. `homepage/functions/playlist/api/playlists.js` forwards that request to the playlist-search API.
5. The API returns normalized Spotify playlist URLs, titles, and snippets.
6. The frontend renders each result as an external Spotify link.

The frontend uses absolute `/playlist/...` asset paths so it works consistently when hosted under the `njmurray.com/playlist/` route.

## How The Spotify Playlists Page Works

`homepage/playlists/index.html` is a static gallery of public Spotify playlists. Each card contains:

- playlist title
- Spotify cover image URL
- direct `open.spotify.com/playlist/...` link

The page has no build step and no client-side data fetch. Updating the playlist list means editing the HTML cards directly, or regenerating that file from Spotify data and committing the new static output.

## Local Development

Install dependencies:

```sh
npm install
```

Run the production homepage locally through Cloudflare Pages:

```sh
npm run dev:homepage
```

Run the standalone finder reference app from the repo root:

```sh
npm run dev
```

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd`:

```sh
npm.cmd run dev:homepage
```

## Deploying

Deploy the homepage project:

```sh
npm run deploy:homepage
```

This deploys the `homepage/` folder to the Cloudflare Pages project named `homepage`.

## Current Notes

- Rare Word Explorer should be linked as `https://njmurray.com/gutenberg/`.
- Playlist Finder should be linked as `https://njmurray.com/playlist/`.
- Spotify Playlists should be linked as `https://njmurray.com/playlists/`.
- The separate `NicJMurray/playlists` repo contains the standalone source for the Spotify Playlists page.
