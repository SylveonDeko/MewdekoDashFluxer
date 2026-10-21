import { env } from "$env/dynamic/private";
import { json, type RequestEvent } from "@sveltejs/kit";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import { mintBackendToken } from "$lib/server/backendJwt";
import {
  defaultInstanceURL,
  resolveInstanceURL,
  resolveInstanceURLByPort,
} from "$lib/server/instances";

const stringIdJson = JSONbig({ storeAsString: true });

/** The answer of a bot API call: the status and the body, parsed when it was JSON. */
export interface BotResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T | null;
  text: string;
}

/**
 * Finds the bot instance this request is aimed at, the same way the `/api` proxy does: the port
 * the browser selected, then the instance cookie, then the only registered instance. The URL is
 * always built from the registered instance list, never from the request.
 */
async function resolveBackend(event: RequestEvent): Promise<string | null> {
  const portHeader = event.request.headers.get("x-instance-port");
  if (portHeader) {
    const port = Number.parseInt(portHeader, 10);
    if (Number.isInteger(port)) return resolveInstanceURLByPort(port);
  }

  const botId = event.cookies.get("selectedInstanceId");
  if (botId && /^\d{1,20}$/.test(botId)) {
    const url = await resolveInstanceURL(botId);
    if (url) return url;
  }

  return defaultInstanceURL();
}

/**
 * Calls the bot API from the server with the dashboard's API key and the signed in user's
 * backend token. Ids in `body` should be `bigint` so they travel as JSON numbers, which is what
 * the bot reads.
 */
export async function callBot<T = unknown>(
  event: RequestEvent,
  path: string,
  method: "GET" | "POST",
  body?: unknown,
): Promise<BotResponse<T>> {
  const backend = await resolveBackend(event);
  if (!backend) return { status: 503, ok: false, data: null, text: "no_instance_available" };

  const headers: Record<string, string> = { "X-API-Key": env.MEWDEKO_API_KEY };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = event.locals.user ? mintBackendToken(event.locals.user) : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${backend}/${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSONbig.stringify(body),
    });
    const text = await response.text();
    let data: T | null = null;
    if (text) {
      try {
        data = stringIdJson.parse(text) as T;
      } catch {
        data = null;
      }
    }
    return { status: response.status, ok: response.ok, data, text };
  } catch (error) {
    logger.error(`Bot API call to ${path} failed:`, error);
    return { status: 503, ok: false, data: null, text: "unavailable" };
  }
}

/**
 * Whether the signed in user administers a server, according to the bot.
 */
export async function userAdministersGuild(event: RequestEvent, guildId: string): Promise<boolean> {
  const user = event.locals.user;
  if (!user) return false;
  const response = await callBot<Array<{ id: unknown }>>(
    event,
    `ClientOperations/mutualguilds/${user.id}?adminOnly=true`,
    "GET",
  );
  if (!response.ok || !Array.isArray(response.data)) return false;
  return response.data.some((guild) => String(guild.id) === guildId);
}

/**
 * Turns a bot answer into the answer this dashboard gives its browser: the data on success, or
 * the bot's short error text with the same status.
 */
export function relayBotResponse(response: BotResponse): Response {
  if (response.ok) return json(response.data);
  const reason = response.text.replace(/^"|"$/g, "").trim().slice(0, 200);
  return json({ error: reason || "failed" }, { status: response.status });
}
