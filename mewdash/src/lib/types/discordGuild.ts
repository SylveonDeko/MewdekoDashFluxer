// lib/types/discordGuild.ts
export type DiscordGuild = {
  id: bigint;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[] | null;
  banner?: string;
  description?: string;
  memberCount?: number;
};

export type GuildInfo = {
  id: bigint;
  name: string;
  icon?: string;
  iconUrl?: string;
  banner?: string;
  bannerUrl?: string;
  description?: string;
  memberCount: number;
  ownerId: bigint;
  createdAt: string;
};

