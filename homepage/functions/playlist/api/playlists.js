const UPSTREAM_API = "https://playlist.njmurray.com/api/playlists";

export async function onRequestGet({ request }) {
  const incoming = new URL(request.url);
  const upstream = new URL(UPSTREAM_API);
  upstream.search = incoming.search;

  const response = await fetch(upstream.toString(), {
    headers: { Accept: "application/json" },
  });

  const headers = new Headers({
    "cache-control": "no-store",
    "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
  });

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Accept, Content-Type",
    },
  });
}
