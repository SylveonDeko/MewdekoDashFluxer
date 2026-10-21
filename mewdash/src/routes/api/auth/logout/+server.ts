import { redirect, type RequestHandler } from "@sveltejs/kit";
import { deleteCookies, revokeStoredRefreshToken } from '../fluxerAuth';

export const GET: RequestHandler = async ({ cookies, locals }) => {
  await revokeStoredRefreshToken(cookies);
  await deleteCookies(cookies);
  locals.user = null;

  redirect(303, '/');
};
