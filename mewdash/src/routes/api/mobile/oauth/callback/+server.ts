import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const APP_CALLBACK = "mewdeko-mobile://oauth/callback";

/**
 * Hands the Fluxer OAuth redirect back to the mobile app.
 */
export const GET: RequestHandler = async ({ url }) => {
  redirect(302, `${APP_CALLBACK}${url.search}`);
};
