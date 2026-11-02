import type { RequestEvent } from "@sveltejs/kit";
import { fluxerApiUrl } from "../../routes/api/auth/fluxerAuth";
import { getOrRefreshToken } from "./fluxerApi";

/** How long a user's server list is reused before asking Fluxer again. */
const CACHE_MS = 5 * 60 * 1000;

const cache = new Map<string, { ids: string[]; at: number }>();

/**
 * Gets the IDs of the servers the signed in user is in, from Fluxer with their own token, so the bot can
 * check membership even when the member is not in its cache. Returns null when the token cannot read the
 * list, such as a sign in from before the guilds scope was requested.
 */
export async function userGuildIds(event: RequestEvent, userId: string): Promise<string[] | null> {
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.ids;

  const token = await getOrRefreshToken(event, event.cookies).catch(() => null);
  if (!token) return null;

  try {
    const response = await fetch(`${fluxerApiUrl()}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return null;

    const guilds = (await response.json()) as { id: string }[];
    const ids = guilds.map((guild) => String(guild.id)).filter((id) => /^\d{1,20}$/.test(id));
    cache.set(userId, { ids, at: Date.now() });
    if (cache.size > 5000) cache.delete(cache.keys().next().value!);
    return ids;
  } catch {
    return null;
  }
}
