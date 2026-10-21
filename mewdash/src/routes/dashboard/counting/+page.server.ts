import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
  const data = await parent();
  
  if (!data.user) {
    redirect(302, "/api/auth/login");
  }

  return {
    user: data.user
  };
};