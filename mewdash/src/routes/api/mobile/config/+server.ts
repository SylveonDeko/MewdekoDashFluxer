import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { fluxerAuthorizeUrl, fluxerScopes } from "../../auth/fluxerAuth";

const DEFAULT_MOBILE_REDIRECT_URI = "mewdeko-mobile://oauth/callback";

/**
 * Public discovery endpoint for the iOS app. The app stores a user-supplied
 * dashboard URL (selfhosters point at their own deployment) and hits this
 * endpoint to learn the Fluxer OAuth parameters that selfhoster has
 * configured. No auth required.
 *
 * Selfhosters must register `MOBILE_OAUTH_REDIRECT_URI` (default
 * `mewdeko-mobile://oauth/callback`) as an allowed redirect on their
 * Fluxer application.
 */
export const GET: RequestHandler = async () => {
  return json({
    fluxer: {
      clientId: env.FLUXER_CLIENT_ID,
      redirectUri: env.MOBILE_OAUTH_REDIRECT_URI ?? DEFAULT_MOBILE_REDIRECT_URI,
      scopes: fluxerScopes(),
      authorizeUrl: fluxerAuthorizeUrl(),
    },
    instance: {
      name: env.PUBLIC_INSTANCE_NAME ?? "Mewdeko",
      inviteUrl: env.PUBLIC_BOT_INVITE_URL ?? null,
    },
    api: {
      version: 1,
    },
  });
};
