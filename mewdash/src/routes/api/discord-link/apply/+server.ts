import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { callBot, relayBotResponse, userAdministersGuild } from "$lib/server/botApi";

const ID = /^\d{1,20}$/;

const toOverrides = (value: unknown): Record<string, bigint> | null => {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const result: Record<string, bigint> = {};
  for (const [key, paired] of Object.entries(value)) {
    if (!ID.test(key) || !ID.test(String(paired))) return null;
    result[key] = BigInt(String(paired));
  }
  return result;
};

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "unauthorized" }, { status: 401 });

  const body = (await event.request.json().catch(() => null)) as {
    guildId?: unknown;
    code?: unknown;
    channelOverrides?: unknown;
    roleOverrides?: unknown;
    copyExpressions?: unknown;
  } | null;
  const guildId = String(body?.guildId ?? "");
  const code = typeof body?.code === "string" ? body.code : "";
  const channelOverrides = toOverrides(body?.channelOverrides);
  const roleOverrides = toOverrides(body?.roleOverrides);
  if (!ID.test(guildId) || !code || !channelOverrides || !roleOverrides) {
    return json({ error: "invalid_request" }, { status: 400 });
  }

  if (!(await userAdministersGuild(event, guildId))) return json({ error: "forbidden" }, { status: 403 });

  return relayBotResponse(
    await callBot(event, `Migration/${guildId}/apply`, "POST", {
      code,
      channelOverrides,
      roleOverrides,
      copyExpressions: body?.copyExpressions !== false,
      userId: BigInt(user.id.toString()),
    }),
  );
};
