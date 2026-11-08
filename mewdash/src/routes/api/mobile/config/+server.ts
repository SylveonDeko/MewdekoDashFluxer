import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { fluxerAuthorizeUrl, fluxerScopes } from "../../auth/fluxerAuth";

const secureOrigin = (url: URL) =>
  ["localhost", "127.0.0.1"].includes(url.hostname) ? url.origin : `https://${url.host}`;

/**
 * Public discovery endpoint for the mobile apps. The app stores a user-supplied
 * dashboard URL (selfhosters point at their own deployment) and hits this
 * endpoint to learn the Fluxer OAuth parameters that selfhoster has
 * configured. No auth required.
 *
 * Selfhosters must register `MOBILE_OAUTH_REDIRECT_URI` (default
 * `<dashboard>/api/mobile/oauth/callback`) as an allowed redirect on their
 * Fluxer application.
 */
export const GET: RequestHandler = async ({ url }) => {
  const oauth = {
    clientId: env.FLUXER_CLIENT_ID,
    redirectUri: env.MOBILE_OAUTH_REDIRECT_URI ?? `${secureOrigin(url)}/api/mobile/oauth/callback`,
    scopes: fluxerScopes(),
    authorizeUrl: fluxerAuthorizeUrl(),
  };
  return json({
    platform: "fluxer",
    oauth,
    fluxer: oauth,
    instance: {
      name: env.PUBLIC_INSTANCE_NAME ?? "Mewdeko",
      inviteUrl: env.PUBLIC_BOT_INVITE_URL ?? null,
    },
    api: {
      version: 1,
    },
  });
};
