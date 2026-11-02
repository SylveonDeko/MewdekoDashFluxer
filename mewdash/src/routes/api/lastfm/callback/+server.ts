import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { callBot } from "$lib/server/botApi";

export const GET: RequestHandler = async (event) => {
  const user = event.locals.user;
  const token = event.url.searchParams.get("token") ?? "";
  if (!user || !token) redirect(303, "/me?lastfm=failed");

  const response = await callBot(
    event,
    `lastfm/link?token=${encodeURIComponent(token)}&userId=${user.id}`,
    "POST",
  );

  redirect(303, response.ok ? "/me?lastfm=success" : "/me?lastfm=failed");
};
