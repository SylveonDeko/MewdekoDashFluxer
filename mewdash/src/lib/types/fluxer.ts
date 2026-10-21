// lib/types/fluxer.ts
export type FluxerUser = {
  id: bigint;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  bot: boolean;
};

/**
 * Maps a Fluxer `/users/@me` payload to the fields the dashboard keeps.
 */
export function toFluxerUser(raw: any): FluxerUser {
  return {
    id: raw.id,
    username: raw.username,
    discriminator: raw.discriminator ?? "0",
    global_name: raw.global_name ?? null,
    avatar: raw.avatar ?? null,
    banner: raw.banner ?? null,
    bot: Boolean(raw.bot),
  };
}
