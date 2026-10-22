# Working on Playlist Finder

- This repository serves `https://playlist.njmurray.com`. Keep it distinct from the curated covers at `https://playlists.njmurray.com` in the separate playlists repository.
- Read `README.md` for the browser and Function request path, and `DEPLOYMENT.md` for current publishing status.
- Use `npm ci`, `npm run build`, and `npm run check:functions` to validate packaging. Use `npm run dev` for local Pages Functions development.
- Only `index.html`, `styles.css`, and `src/` belong in public `dist/`. Keep `functions/`, credentials, docs, package files, and development dependencies outside it.
- Preserve Pages project `spotify-playlist-finder-v2` and its existing encrypted `GOOGLE_API_KEY` and `GOOGLE_CSE_ID` settings. They cannot be recovered from the API, so do not replace the project or delete its settings as a deployment workaround.
- Never copy the Google credentials into frontend code, build variables, committed files, or command output. Use ignored `.dev.vars` for local credentials.
- Keep browser and server Spotify URL validation aligned when changing URL rules.
- Update documentation when behaviour, commands, or hosting changes.
- When publishing is requested or authorized, push checked changes to `main`, confirm the GitHub Actions deployment for that commit, and verify the page and API. A successful old page is not proof of a new deployment.
