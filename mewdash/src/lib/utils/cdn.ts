export const FLUXER_MEDIA_HOST = "https://fluxerusercontent.com";
export const FLUXER_STATIC_HOST = "https://fluxerstatic.com";
export const FLUXER_WEB_HOST = "https://web.fluxer.app";

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
  return `${FLUXER_STATIC_HOST}/avatars/${index}.png`;
}

/**
 * Builds a user avatar URL, using the animated format for `a_` hashes and the default avatar when there is no hash.
 */
export function userAvatarUrl(userId: Snowflake, hash?: string | null, size?: number): string {
  if (!hash) return defaultAvatarUrl(userId);
  return withSize(`${FLUXER_MEDIA_HOST}/avatars/${userId}/${hash}.${imageExtension(hash)}`, size);
}

export function guildMemberAvatarUrl(guildId: Snowflake, userId: Snowflake, hash?: string | null, size?: number): string {
  if (!hash) return defaultAvatarUrl(userId);
  return withSize(`${FLUXER_MEDIA_HOST}/guilds/${guildId}/users/${userId}/avatars/${hash}.${imageExtension(hash)}`, size);
}

export function guildIconUrl(guildId: Snowflake, hash: string, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/icons/${guildId}/${hash}.${imageExtension(hash)}`, size);
}

/**
 * Builds a user or guild banner URL from the owner id and banner hash.
 */
export function bannerUrl(ownerId: Snowflake, hash: string, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/banners/${ownerId}/${hash}.${imageExtension(hash)}`, size);
}

export function memberBannerUrl(guildId: Snowflake, userId: Snowflake, hash: string, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/guilds/${guildId}/users/${userId}/banners/${hash}.webp`, size);
}

export function splashUrl(guildId: Snowflake, hash: string, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/splashes/${guildId}/${hash}.webp`, size);
}

export function embedSplashUrl(guildId: Snowflake, hash: string, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/embed-splashes/${guildId}/${hash}.webp`, size);
}

export function emojiUrl(emojiId: Snowflake, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/emojis/${emojiId}.webp`, size);
}

export function stickerUrl(stickerId: Snowflake, size?: number): string {
  return withSize(`${FLUXER_MEDIA_HOST}/stickers/${stickerId}.webp`, size);
}

export function channelUrl(guildId: Snowflake | undefined, channelId?: Snowflake): string {
  return channelId
    ? `${FLUXER_WEB_HOST}/channels/${guildId ?? "@me"}/${channelId}`
    : `${FLUXER_WEB_HOST}/channels/${guildId ?? "@me"}`;
}

export function messageUrl(guildId: Snowflake, channelId: Snowflake, messageId: Snowflake): string {
  return `${FLUXER_WEB_HOST}/channels/${guildId}/${channelId}/${messageId}`;
}

export function botInviteUrl(clientId: Snowflake, permissions: Snowflake, guildId?: Snowflake): string {
  const params = new URLSearchParams({ client_id: String(clientId), scope: "bot", permissions: String(permissions) });
  if (guildId) params.set("guild_id", String(guildId));
  return `${FLUXER_WEB_HOST}/oauth2/authorize?${params.toString()}`;
}
