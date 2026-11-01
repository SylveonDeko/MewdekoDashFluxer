import type { LayoutServerLoad } from "./$types";
import { fluxerHosts } from "$lib/server/fluxerInstance";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    locale: locals.locale,
    fluxerHosts: fluxerHosts()
  };
};