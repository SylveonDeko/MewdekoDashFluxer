/**
 * Returns a URL a canvas can read pixels from. Fluxer's image hosts send no CORS headers, so images from other
 * sites go through the dashboard's image proxy, which only serves allowed hosts.
 */
export function corsSafeImageUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) return url;
  if (typeof window !== "undefined" && url.startsWith(window.location.origin)) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}
