const CANONICAL_PLAYLIST_URL = "https://njmurray.com/playlist/";

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    return next();
  }

  return Response.redirect(CANONICAL_PLAYLIST_URL, 301);
}
