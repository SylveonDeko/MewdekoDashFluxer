import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sessionManager } from "$lib/server/redisSession";
import { callBot, relayBotResponse, userAdministersGuild } from "$lib/server/botApi";
import { canAdministerDiscordGuild } from "$lib/types/discordLink";

const ID = /^\d{1,20}$/;

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "unauthorized" }, { status: 401 });

  const body = (await event.request.json().catch(() => null)) as { guildId?: unknown; discordGuildId?: unknown; botId?: unknown } | null;
  const guildId = String(body?.guildId ?? "");
  const discordGuildId = String(body?.discordGuildId ?? "");
  const botId = String(body?.botId ?? "");
  if (!ID.test(guildId) || !ID.test(discordGuildId) || !ID.test(botId)) return json({ error: "invalid_request" }, { status: 400 });

  if (!(await userAdministersGuild(event, guildId))) return json({ error: "forbidden" }, { status: 403 });

  const identity = await sessionManager.getDiscordIdentity(user.id.toString());
  if (!identity) return json({ error: "discord_not_connected" }, { status: 401 });

  const owned = identity.guilds.find((guild) => guild.id === discordGuildId);
  if (!owned || !canAdministerDiscordGuild(owned)) return json({ error: "not_admin" }, { status: 403 });

  return relayBotResponse(
    await callBot(event, `Migration/${guildId}/export`, "POST", {
      discordUserId: BigInt(identity.discordUserId),
      discordGuildId: BigInt(discordGuildId),
      botId: BigInt(botId),
    }),
  );
};
