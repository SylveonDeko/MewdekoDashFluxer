// lib/api/migration/migration.ts
import { apiRequest } from "../core";
import type {
  DiscordIdentitySummary,
  DiscordServer,
  LinkResult,
  LinkState,
  MigrationPreview,
  MigrationResult,
  MigrationStatus,
  PairOverrides,
} from "./models";

/**
 * Turns pairs of id strings into numbers on the wire, which is how the bot reads ids.
 */
function idPairs(pairs: PairOverrides): Record<string, bigint> {
  return Object.fromEntries(Object.entries(pairs).map(([key, value]) => [key, BigInt(value)]));
}

/**
 * Moving a server and its members over from Mewdeko on Discord.
 * Maps to Mewdeko.Controllers.MigrationController. Calls that carry a Discord identity go to the
 * dashboard's own `discord-link` endpoints, which hold the Discord sign in on the server.
 */
export const migrationApi = {
  getIdentity: () => apiRequest<DiscordIdentitySummary | null>("discord-link/identity"),

  clearIdentity: () => apiRequest<{ cleared: boolean }>("discord-link/identity", "DELETE"),

  getDiscordServers: () => apiRequest<DiscordServer[]>("discord-link/servers", "POST"),

  exportServer: (guildId: bigint, discordGuildId: string, botId: string) =>
    apiRequest<{ code: string }>("discord-link/export", "POST", {
      guildId: guildId.toString(),
      discordGuildId,
      botId,
    }),

  preview: (guildId: bigint, code: string, channelOverrides: PairOverrides, roleOverrides: PairOverrides) =>
    apiRequest<MigrationPreview>(`Migration/${guildId}/preview`, "POST", {
      code,
      channelOverrides: idPairs(channelOverrides),
      roleOverrides: idPairs(roleOverrides),
    }),

  apply: (guildId: bigint, code: string, channelOverrides: PairOverrides, roleOverrides: PairOverrides, copyExpressions: boolean) =>
    apiRequest<MigrationResult>("discord-link/apply", "POST", {
      guildId: guildId.toString(),
      code,
      channelOverrides,
      roleOverrides,
      copyExpressions,
    }),

  getStatus: (guildId: bigint) => apiRequest<MigrationStatus>(`Migration/${guildId}/status`),

  getLink: () => apiRequest<LinkState>("discord-link/link"),

  link: () => apiRequest<LinkResult>("discord-link/link", "POST"),
};

export function discordSignInUrl(returnPath: string): string {
  return `/api/discord-link/start?return=${encodeURIComponent(returnPath)}`;
}
