import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sessionManager } from "$lib/server/redisSession";
import { callBot, relayBotResponse } from "$lib/server/botApi";
import { canAdministerDiscordGuild } from "$lib/types/discordLink";

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "unauthorized" }, { status: 401 });

  const identity = await sessionManager.getDiscordIdentity(user.id.toString());
  if (!identity) return json({ error: "discord_not_connected" }, { status: 401 });

  const guildIds = identity.guilds.filter(canAdministerDiscordGuild).map((guild) => BigInt(guild.id));
  if (guildIds.length === 0) return json([]);

  return relayBotResponse(
    await callBot(event, "Migration/discord-servers", "POST", {
      discordUserId: BigInt(identity.discordUserId),
      guildIds,
    }),
  );
};
