import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sessionManager } from "$lib/server/redisSession";
import type { DiscordLinkIdentitySummary } from "$lib/types/discordLink";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: "unauthorized" }, { status: 401 });

  const identity = await sessionManager.getDiscordIdentity(locals.user.id.toString());
  if (!identity) return json(null);

  const { guilds: _guilds, ...summary } = identity;
  return json(summary satisfies DiscordLinkIdentitySummary);
};

export const DELETE: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: "unauthorized" }, { status: 401 });

  await sessionManager.clearDiscordIdentity(locals.user.id.toString());
  return json({ cleared: true });
};
