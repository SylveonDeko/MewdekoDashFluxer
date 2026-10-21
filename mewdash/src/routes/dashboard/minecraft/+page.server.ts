// routes/dashboard/minecraft/+page.server.ts
import type { PageServerLoad } from "./$types";
import type { FluxerUser } from "$lib/types/fluxer";

// @ts-ignore
export const load: PageServerLoad = ({ locals }): { user?: FluxerUser } => {
  if (!locals.user) return {};
  return { user: locals.user };
};
