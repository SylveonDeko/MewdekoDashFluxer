/** The hosts image and link URLs are built from. */
export interface FluxerHosts {
  web: string;
  media: string;
  static: string;
  invite: string;
}

export const DEFAULT_FLUXER_HOSTS: FluxerHosts = {
  web: "https://web.fluxer.app",
  media: "https://fluxerusercontent.com",
  static: "https://fluxerstatic.com",
  invite: "https://fluxer.gg"
};

let hosts: FluxerHosts = DEFAULT_FLUXER_HOSTS;

/** Points the URL builders at the hosts of the instance the dashboard runs against. */
export function setFluxerHosts(next: FluxerHosts | null | undefined): void {
  if (next) hosts = next;
}

/** The hosts the URL builders currently use. */
export const fluxerHosts = (): FluxerHosts => hosts;

type Snowflake = string | number | bigint;

function withSize(url: string, size?: number): string {
  return size ? `${url}?size=${size}` : url;
}

function imageExtension(hash: string, fallback = "png"): string {
  return hash.startsWith("a_") ? "webp" : fallback;
}

/**
 * Builds the URL of a default avatar, chosen from the user id the same way Fluxer does.
 */
export function defaultAvatarUrl(userId: Snowflake = 0): string {
  let index = 0;
  try {
    index = Number(BigInt(userId) % 6n);
  } catch {
    index = 0;
  }
  return `${hosts.static}/avatars/${index}.png`;
}

/**
 * Builds a user avatar URL, using the animated format for `a_` hashes and the default avatar when there is no hash.
 */
export function userAvatarUrl(userId: Snowflake, hash?: string | null, size?: number): string {
  if (!hash) return defaultAvatarUrl(userId);
  return withSize(`${hosts.media}/avatars/${userId}/${hash}.${imageExtension(hash)}`, size);
}

export function guildMemberAvatarUrl(guildId: Snowflake, userId: Snowflake, hash?: string | null, size?: number): string {
  if (!hash) return defaultAvatarUrl(userId);
  return withSize(`${hosts.media}/guilds/${guildId}/users/${userId}/avatars/${hash}.${imageExtension(hash)}`, size);
}

export function guildIconUrl(guildId: Snowflake, hash: string, size?: number): string {
  return withSize(`${hosts.media}/icons/${guildId}/${hash}.${imageExtension(hash)}`, size);
}

/**
 * Builds a user or guild banner URL from the owner id and banner hash.
 */
export function bannerUrl(ownerId: Snowflake, hash: string, size?: number): string {
  return withSize(`${hosts.media}/banners/${ownerId}/${hash}.${imageExtension(hash)}`, size);
}

export function memberBannerUrl(guildId: Snowflake, userId: Snowflake, hash: string, size?: number): string {
  return withSize(`${hosts.media}/guilds/${guildId}/users/${userId}/banners/${hash}.webp`, size);
}

export function splashUrl(guildId: Snowflake, hash: string, size?: number): string {
  return withSize(`${hosts.media}/splashes/${guildId}/${hash}.webp`, size);
}

export function embedSplashUrl(guildId: Snowflake, hash: string, size?: number): string {
  return withSize(`${hosts.media}/embed-splashes/${guildId}/${hash}.webp`, size);
}

export function emojiUrl(emojiId: Snowflake, size?: number): string {
  return withSize(`${hosts.media}/emojis/${emojiId}.webp`, size);
}

export function stickerUrl(stickerId: Snowflake, size?: number): string {
  return withSize(`${hosts.media}/stickers/${stickerId}.webp`, size);
}

export function channelUrl(guildId: Snowflake | undefined, channelId?: Snowflake): string {
  return channelId
    ? `${hosts.web}/channels/${guildId ?? "@me"}/${channelId}`
    : `${hosts.web}/channels/${guildId ?? "@me"}`;
}

export function messageUrl(guildId: Snowflake, channelId: Snowflake, messageId: Snowflake): string {
  return `${hosts.web}/channels/${guildId}/${channelId}/${messageId}`;
}

export function botInviteUrl(clientId: Snowflake, permissions: Snowflake, guildId?: Snowflake): string {
  const params = new URLSearchParams({ client_id: String(clientId), scope: "bot", permissions: String(permissions) });
  if (guildId) params.set("guild_id", String(guildId));
  return `${hosts.web}/oauth2/authorize?${params.toString()}`;
}
