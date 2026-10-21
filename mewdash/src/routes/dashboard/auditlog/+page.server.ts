// routes/dashboard/auditlog/+page.server.ts
import type { PageServerLoad } from "./$types";
import type { FluxerUser } from "$lib/types/fluxer";

// @ts-ignore
// locals can be any type because it is just a context thing
export const load: PageServerLoad = ({ locals }): { user?: FluxerUser } => {
  if (!locals.user) return {};
  return { user: locals.user };
};
