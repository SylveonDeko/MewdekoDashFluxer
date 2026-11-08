// routes/globallist/review/+page.server.ts
import { redirect } from "@sveltejs/kit";
import { callBot } from "$lib/server/botApi";
import type { PageServerLoad } from "./$types";

/**
 * Whether the signed in user may review is decided by the bot.
 */
export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    const target = encodeURIComponent(event.url.pathname + event.url.search);
    redirect(302, `/api/auth/login?redirect_to=${target}`);
  }

  const response = await callBot<{ isReviewer: boolean; isOwner: boolean }>(
    event,
    "GlobalListReview/me",
    "GET"
  );

  if (!response.ok || !response.data) {
    const denied = response.status === 401 || response.status === 403;
    return { user, status: denied ? ("denied" as const) : ("unavailable" as const), isOwner: false };
  }

  return {
    user,
    status: response.data.isReviewer ? ("allowed" as const) : ("denied" as const),
    isOwner: response.data.isReviewer && response.data.isOwner
  };
};
