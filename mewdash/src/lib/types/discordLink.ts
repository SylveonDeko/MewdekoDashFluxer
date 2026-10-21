// lib/types/discordLink.ts
export type DiscordLinkGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

/**
 * A Discord identity proved by signing in with Discord. Kept server side for a short time and
 * never holds a Discord token.
 */
export type DiscordLinkIdentity = {
  discordUserId: string;
  username: string;
  avatar: string | null;
  guilds: DiscordLinkGuild[];
  expiresAt: string;
};

/** What the browser may see of a stored Discord identity. */
export type DiscordLinkIdentitySummary = Omit<DiscordLinkIdentity, "guilds">;

export const DISCORD_ADMINISTRATOR = 0x8n;

/**
 * Whether the Discord user owns the server or has Administrator in it.
 */
export function canAdministerDiscordGuild(guild: DiscordLinkGuild): boolean {
  if (guild.owner) return true;
  try {
    return (BigInt(guild.permissions) & DISCORD_ADMINISTRATOR) === DISCORD_ADMINISTRATOR;
  } catch {
    return false;
  }
}
