export const SPOTIFY_HOST = "open.spotify.com";
export const PLAYLIST_TOKEN = "/playlist";

export function normalizeUrl(input) {
  if (!input) return "";
  try {
    const parsed = new URL(input);
    if (
      parsed.hostname.endsWith("google.com") &&
      parsed.pathname.startsWith("/url")
    ) {
      for (const key of ["url", "q", "u"]) {
        const candidate = parsed.searchParams.get(key);
        if (candidate) return candidate;
      }
    }
    return input;
  } catch (error) {
    return input;
  }
}

export function canonicalSpotifyUrl(input) {
  try {
    const normalized = normalizeUrl(input);
    if (!normalized) return "";
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes(SPOTIFY_HOST)) {
      return normalized;
    }

    let path = parsed.pathname;
    if (path.startsWith("/embed/")) {
      path = path.replace("/embed", "", 1);
    }
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return `https://${SPOTIFY_HOST}${path}`;
  } catch (error) {
    return input ?? "";
  }
}

export function onlyPlaylistResults(results = []) {
  const seen = new Set();
  const output = [];

  for (const result of results) {
    const rawUrl =
      result?.url || result?.link || result?.href || result?.playlist_url || "";
    const url = canonicalSpotifyUrl(rawUrl);
    if (!url) continue;

    let parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      continue;
    }

    if (!parsed.hostname.includes(SPOTIFY_HOST)) continue;
    if (!parsed.pathname.includes(PLAYLIST_TOKEN)) continue;

    const dedupeKey = url.split("?", 1)[0];
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const title =
      (result?.title || result?.name || result?.playlist_name || "").trim() || url;
    const snippet =
      (result?.snippet || result?.body || result?.description || "").trim();

    output.push({ title, url: dedupeKey, snippet });
  }

  return output;
}

export function buildQuery(terms = []) {
  const cleaned = terms
    .map((term) => (term ?? "").trim())
    .filter((term) => term.length);

  const quoted = cleaned.map((term) => `"${term.replace(/"/g, '\\"')}"`);
  const suffix = quoted.join(" ");

  return [`site:${SPOTIFY_HOST}`, "inurl:playlist", suffix]
    .filter((part) => part && part.trim())
    .join(" ")
    .trim();
}

export const spotifyUtils = {
  buildQuery,
  canonicalSpotifyUrl,
  normalizeUrl,
  onlyPlaylistResults,
};
