import { redirect } from "@sveltejs/kit";
import { timingSafeEqual } from "node:crypto";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";
import { logger } from "$lib/logger";
import { DISCORD_LINK_TTL, sessionManager } from "$lib/server/redisSession";
import type { DiscordLinkGuild, DiscordLinkIdentity } from "$lib/types/discordLink";
import { DISCORD_API_URL, DISCORD_RETURN_COOKIE, DISCORD_STATE_COOKIE, safeReturnPath } from "../discordLink";

const sameValue = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const withResult = (path: string, result: "error" | "denied"): string => {
  const target = new URL(path, "http://localhost");
  target.searchParams.set("discord_link", result);
  return `${target.pathname}${target.search}${target.hash}`;
};

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
  const returnPath = safeReturnPath(cookies.get(DISCORD_RETURN_COOKIE));
  const expectedState = cookies.get(DISCORD_STATE_COOKIE);
  cookies.delete(DISCORD_STATE_COOKIE, { path: "/" });
  cookies.delete(DISCORD_RETURN_COOKIE, { path: "/" });

  const user = locals.user;
  if (!user) redirect(302, "/api/auth/login?redirect_to=" + encodeURIComponent(returnPath));

  const state = url.searchParams.get("state");
  if (!expectedState || !state || !sameValue(state, expectedState)) {
    redirect(302, withResult(returnPath, "error"));
  }

  const code = url.searchParams.get("code");
  if (url.searchParams.get("error") || !code) redirect(302, withResult(returnPath, "denied"));

  try {
    const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.DISCORD_LINK_CLIENT_ID,
        client_secret: env.DISCORD_LINK_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: env.DISCORD_LINK_REDIRECT_URI,
      }),
    });
    if (!tokenResponse.ok) throw new Error(`Discord token exchange failed with ${tokenResponse.status}`);
    const accessToken = (await tokenResponse.json()).access_token as string;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const [userResponse, guildsResponse] = await Promise.all([
      fetch(`${DISCORD_API_URL}/users/@me`, { headers }),
      fetch(`${DISCORD_API_URL}/users/@me/guilds`, { headers }),
    ]);
    if (!userResponse.ok || !guildsResponse.ok) {
      throw new Error(`Discord lookups failed with ${userResponse.status} and ${guildsResponse.status}`);
    }

    const discordUser = await userResponse.json();
    const rawGuilds = (await guildsResponse.json()) as Array<Record<string, unknown>>;
    const guilds: DiscordLinkGuild[] = rawGuilds.map((guild) => ({
      id: String(guild.id),
      name: String(guild.name),
      icon: typeof guild.icon === "string" ? guild.icon : null,
      owner: Boolean(guild.owner),
      permissions: String(guild.permissions ?? "0"),
    }));

    const identity: DiscordLinkIdentity = {
      discordUserId: String(discordUser.id),
      username: String(discordUser.global_name ?? discordUser.username),
      avatar: typeof discordUser.avatar === "string" ? discordUser.avatar : null,
      guilds,
      expiresAt: new Date(Date.now() + DISCORD_LINK_TTL * 1000).toISOString(),
    };
    await sessionManager.setDiscordIdentity(user.id.toString(), identity);
  } catch (error) {
    logger.error("Discord sign in for linking failed:", error instanceof Error ? error.message : String(error));
    redirect(302, withResult(returnPath, "error"));
  }

  redirect(302, returnPath);
};
