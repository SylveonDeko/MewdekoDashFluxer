// lib/api/migration/models/index.ts

/** A Discord server the signed in Discord user can bring over, from one Mewdeko instance on Discord. */
export interface DiscordServer {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  botId: string;
  botName: string;
  botAvatar: string | null;
}

export interface MigrationChannelPreview {
  id: string;
  name: string;
  type: number;
  parentName: string | null;
  fluxerId: string | null;
}

export interface MigrationRolePreview {
  id: string;
  name: string;
  color: number;
  fluxerId: string | null;
}

export interface MigrationPreview {
  code: string;
  discordGuildId: string;
  discordGuildName: string;
  channels: MigrationChannelPreview[];
  roles: MigrationRolePreview[];
  emojisMatched: number;
  emojisTotal: number;
  emojisToCopy: number;
  stickersTotal: number;
  stickersToCopy: number;
  tables: number;
  settingRows: number;
  memberRows: number;
  members: number;
  linkedMembers: number;
}

export interface MigrationResult {
  written: number;
  held: number;
  dropped: number;
  failed: number;
  waitingMembers: number;
  reposted: number;
  expressions: MigrationExpressionResult | null;
}

export type MigrationStatus =
  | { migrated: false }
  | { migrated: true; discordGuildId: string; migratedAt: string; waitingMembers: number };

export interface DiscordIdentitySummary {
  discordUserId: string;
  username: string;
  avatar: string | null;
  expiresAt: string;
}

export interface LinkState {
  linked: boolean;
  discordUserId: string | null;
}

export interface LinkResult {
  linked: boolean;
  alreadyLinkedElsewhere: boolean;
  rows: number;
  servers: number;
}

export type PairOverrides = Record<string, string>;

export interface MigrationExpressionResult {
  emojisCopied: number;
  emojisFailed: number;
  stickersCopied: number;
  stickersFailed: number;
  missingPermission: boolean;
}

export type MigrationApplyStatus =
  | { state: "none" }
  | { state: "running"; startedAt: string }
  | { state: "done"; outcome: MigrationResult }
  | { state: "failed"; error: string };
