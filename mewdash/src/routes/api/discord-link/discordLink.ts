import type { RequestEvent } from "@sveltejs/kit";
import { getSession, verifyAccessToken } from "$lib/server/mobileJwt";

export const DISCORD_API_URL = "https://discord.com/api/v10",
  DISCORD_AUTHORIZE_URL = "https://discord.com/oauth2/authorize",
  DISCORD_LINK_SCOPES = "identify guilds",
  DISCORD_STATE_COOKIE = "discord_link_state",
  DISCORD_RETURN_COOKIE = "discord_link_return";

const FALLBACK_RETURN = "/dashboard";

/**
 * Lets the mobile app call these routes with its access token. A browser session already sets
 * `locals.user`, so this only fills it in when a valid mobile Bearer token came instead.
 */
export async function adoptMobileUser(event: RequestEvent): Promise<void> {
  if (event.locals.user) return;
  const header = event.request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return;
  const claims = verifyAccessToken(header.slice("bearer ".length).trim());
  if (!claims) return;
  const session = await getSession(claims.sid);
  if (session) event.locals.user = session.user;
}

/**
 * Narrows a requested return path to a same-origin relative path. Anything else, including
 * absolute URLs, protocol-relative URLs and backslash tricks, becomes the dashboard.
 */
export function safeReturnPath(requested: string | null | undefined): string {
  if (!requested) return FALLBACK_RETURN;
  if (!requested.startsWith("/") || requested.startsWith("//") || requested.includes("\\")) return FALLBACK_RETURN;
  if (/[\u0000-\u001f]/.test(requested)) return FALLBACK_RETURN;
  try {
    const resolved = new URL(requested, "http://localhost");
    if (resolved.origin !== "http://localhost") return FALLBACK_RETURN;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return FALLBACK_RETURN;
  }
}
