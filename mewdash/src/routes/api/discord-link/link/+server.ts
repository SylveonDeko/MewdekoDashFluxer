import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sessionManager } from "$lib/server/redisSession";
import { callBot, relayBotResponse } from "$lib/server/botApi";

export const GET: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "unauthorized" }, { status: 401 });

  return relayBotResponse(await callBot(event, `Migration/link/${user.id}`, "GET"));
};

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "unauthorized" }, { status: 401 });

  const identity = await sessionManager.getDiscordIdentity(user.id.toString());
  if (!identity) return json({ error: "discord_not_connected" }, { status: 401 });

  const response = await callBot(event, "Migration/link", "POST", {
    userId: BigInt(user.id.toString()),
    discordUserId: BigInt(identity.discordUserId),
  });
  if (response.ok) await sessionManager.clearDiscordIdentity(user.id.toString());
  return relayBotResponse(response);
};
