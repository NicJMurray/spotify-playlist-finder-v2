import { onlyPlaylistResults } from "../_lib/spotify.js";

const GOOGLE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;
const MAX_PAGES = 1;
const CACHE_TTL_SECONDS = 60 * 60 * 12;
const ALLOWED_ORIGINS = new Set([
  "https://njmurray.com",
  "https://www.njmurray.com",
  "https://playlist.njmurray.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    return jsonResponse({ error: "Missing required query parameter 'q'." }, 400, request);
  }

  const limit = clampInt(url.searchParams.get("limit"), 1, MAX_LIMIT) || DEFAULT_LIMIT;
  const requestedPageSize = clampInt(url.searchParams.get("pageSize"), 1, DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(requestedPageSize, DEFAULT_PAGE_SIZE);
  const requestedPages = clampInt(url.searchParams.get("pages"), 1, MAX_PAGES);
  const inferredPages = Math.max(1, Math.ceil(limit / pageSize));
  const pages = Math.min(requestedPages || inferredPages, MAX_PAGES);

  const apiKey = env.GOOGLE_API_KEY;
  const cseId = env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return jsonResponse({ error: "Google CSE credentials are not configured." }, 500, request);
  }

  const cache = getCache();
  const cacheKey = buildCacheKey(request, query, limit);
  const cached = await cache?.match(cacheKey);
  if (cached) {
    return cached;
  }

  let deduped = [];
  for (const searchQuery of buildQueryVariants(query)) {
    const result = await fetchSearchResults({ apiKey, cseId, query: searchQuery, pageSize, pages });
    if (result.error) {
      return jsonResponse(result.error.body, result.error.status, request);
    }

    deduped = onlyPlaylistResults(result.items);
    if (deduped.length) break;
  }

  const total = deduped.length;
  const response = jsonResponse({ results: deduped.slice(0, limit), total, limit }, 200, request, {
    "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
  });
  await cache?.put(cacheKey, response.clone());
  return response;
}

async function fetchSearchResults({ apiKey, cseId, query, pageSize, pages }) {
  const items = [];
  for (let i = 0; i < pages; i += 1) {
    const start = 1 + i * pageSize;
    const response = await fetchPage({ apiKey, cseId, query, pageSize, start });

    if (!response) break;

    const { status, data, headers } = response;

    if (status === 200) {
      const pageItems = Array.isArray(data?.items) ? data.items : [];
      for (const item of pageItems) {
        items.push({
          title: item?.title,
          url: item?.link,
          snippet: item?.snippet,
        });
      }

      if (i < pages - 1) {
        await sleep(150);
      }

      continue;
    }

    if (status === 429 || status === 403) {
      const retryAfter = headers?.["retry-after"];
      return {
        error: {
          status,
          body: {
            error: status === 429 ? "Google CSE rate limit hit." : "Google CSE quota or access denied.",
            retryAfter,
          },
        },
      };
    }

    break;
  }

  return { items };
}

async function fetchPage({ apiKey, cseId, query, pageSize, start }) {
  const params = new URLSearchParams({
    key: apiKey,
    cx: cseId,
    q: query,
    num: String(pageSize),
    start: String(start),
    safe: "off",
    hl: "en",
  });

  const url = `${GOOGLE_ENDPOINT}?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const headers = Object.fromEntries(res.headers.entries());
    let data = {};
    if (headers["content-type"]?.includes("application/json")) {
      try {
        data = await res.clone().json();
      } catch (error) {
        data = {};
      }
    }
    return { status: res.status, data, headers };
  } catch (error) {
    return null;
  }
}

function clampInt(value, min, max) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return undefined;
  return Math.min(Math.max(n, min), max);
}

function buildQueryVariants(query) {
  const normalized = query.replace(/\s+/g, " ").trim();
  const stripped = stripPlaylistOperators(normalized);
  return Array.from(new Set([normalized, stripped].filter(Boolean)));
}

function stripPlaylistOperators(query) {
  return query
    .replace(/\bsite:open\.spotify\.com\b/gi, "")
    .replace(/\binurl:playlist\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCacheKey(request, query, limit) {
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  cacheUrl.searchParams.set("q", stripPlaylistOperators(query) || query);
  cacheUrl.searchParams.set("limit", String(limit));
  return new Request(cacheUrl.toString(), { method: "GET" });
}

function getCache() {
  try {
    return caches?.default;
  } catch (error) {
    return undefined;
  }
}

function jsonResponse(body, status = 200, request, extraHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(request),
      ...extraHeaders,
    },
  });
}

function corsHeaders(request) {
  const headers = {
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Accept, Content-Type",
    "vary": "Origin",
  };
  const origin = request?.headers?.get("Origin");
  if (!origin) {
    headers["access-control-allow-origin"] = "*";
  } else if (ALLOWED_ORIGINS.has(origin)) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
