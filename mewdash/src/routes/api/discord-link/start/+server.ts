import { error, redirect } from "@sveltejs/kit";
import { randomBytes } from "node:crypto";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";
import { DISCORD_AUTHORIZE_URL, DISCORD_LINK_SCOPES, DISCORD_STATE_COOKIE, DISCORD_RETURN_COOKIE, safeReturnPath } from "../discordLink";

export const GET: RequestHandler = ({ url, cookies, locals }) => {
  if (!locals.user) error(401, "unauthorized");
  if (!env.DISCORD_LINK_CLIENT_ID || !env.DISCORD_LINK_REDIRECT_URI) error(503, "discord_link_not_configured");

  const state = randomBytes(24).toString("base64url");
  const options = {
    path: "/",
    maxAge: 600,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
  cookies.set(DISCORD_STATE_COOKIE, state, options);
  cookies.set(DISCORD_RETURN_COOKIE, safeReturnPath(url.searchParams.get("return")), options);

  const authorizeUrl = new URL(DISCORD_AUTHORIZE_URL);
  authorizeUrl.searchParams.append("client_id", env.DISCORD_LINK_CLIENT_ID);
  authorizeUrl.searchParams.append("redirect_uri", env.DISCORD_LINK_REDIRECT_URI);
  authorizeUrl.searchParams.append("response_type", "code");
  authorizeUrl.searchParams.append("scope", DISCORD_LINK_SCOPES);
  authorizeUrl.searchParams.append("state", state);
  authorizeUrl.searchParams.append("prompt", "consent");

  redirect(302, authorizeUrl.toString());
};
