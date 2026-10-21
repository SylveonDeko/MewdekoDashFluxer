// routes/dashboard/access/+page.server.ts
import type { PageServerLoad } from "./$types";
import type { FluxerUser } from "$lib/types/fluxer";

// @ts-ignore
// More or less because locals can be any type because its just a context thing
export const load: PageServerLoad = ({ locals }): { user?: FluxerUser } => {
  if (!locals.user) return {};
  return { user: locals.user };
};
