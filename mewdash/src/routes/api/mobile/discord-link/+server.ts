import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const APP_CALLBACK = "mewdeko-mobile://oauth/discord-link";

/**
 * Hands the Discord sign in for moving a server back to the mobile app.
 */
export const GET: RequestHandler = async ({ url }) => {
  redirect(302, `${APP_CALLBACK}${url.search}`);
};
