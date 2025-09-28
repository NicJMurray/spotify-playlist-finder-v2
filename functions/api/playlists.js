import { onlyPlaylistResults } from "../_lib/spotify.js";

const GOOGLE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;
const MAX_PAGES = 5;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    return jsonResponse({ error: "Missing required query parameter 'q'." }, 400);
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
    return jsonResponse({ error: "Google CSE credentials are not configured." }, 500);
  }

  const aggregated = [];
  for (let i = 0; i < pages; i += 1) {
    const start = 1 + i * pageSize;
    const response = await fetchPage({ apiKey, cseId, query, pageSize, start });

    if (!response) break;

    const { status, data, headers } = response;

    if (status === 200) {
      const items = Array.isArray(data?.items) ? data.items : [];
      for (const item of items) {
        aggregated.push({
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
      return jsonResponse(
        {
          error: status === 429 ? "Google CSE rate limit hit." : "Google CSE quota or access denied.",
          retryAfter,
        },
        status,
      );
    }

    break;
  }

  const deduped = onlyPlaylistResults(aggregated);
  const total = deduped.length;
  return jsonResponse({ results: deduped.slice(0, limit), total, limit });
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

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
