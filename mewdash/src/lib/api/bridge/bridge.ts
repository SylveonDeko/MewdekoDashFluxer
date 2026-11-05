// lib/api/bridge/bridge.ts
import { apiRequest } from "../core";
import type { Bridge, BridgeCode, BridgeSettings, Pair, PairConnectResult, PairSettings } from "./models";

/**
 * Channel bridge API
 * Maps to Mewdeko.Controllers.BridgeController
 */
export const bridgeApi = {
  /** Gets the guild's bridges */
  getBridges: (guildId: bigint) => apiRequest<Bridge[]>(`Bridge/${guildId}`),

  /** Makes a code to enter on the other platform */
  createCode: (guildId: bigint, channelId: bigint, userId: bigint) =>
    apiRequest<BridgeCode>(`Bridge/${guildId}/code`, "POST", { channelId, userId }),

  /** Links a channel to a code made on the other platform */
  link: (guildId: bigint, code: string, channelId: bigint, userId: bigint) =>
    apiRequest<Bridge>(`Bridge/${guildId}/link`, "POST", { code, channelId, userId }),

  /** Pauses a bridge */
  pause: (guildId: bigint, bridgeId: string) =>
    apiRequest<void>(`Bridge/${guildId}/${bridgeId}/pause`, "POST"),

  /** Resumes a bridge */
  resume: (guildId: bigint, bridgeId: string) =>
    apiRequest<void>(`Bridge/${guildId}/${bridgeId}/resume`, "POST"),

  /** Sets whether a bridge relays bot messages */
  setAllowBots: (guildId: bigint, bridgeId: string, allow: boolean) =>
    apiRequest<void>(`Bridge/${guildId}/${bridgeId}/allow-bots`, "POST", { allow }),

  /** Replaces the relay rules of a bridge */
  updateSettings: (guildId: bigint, bridgeId: string, settings: BridgeSettings) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/settings`, "POST", settings),

  /** Removes a bridge */
  remove: (guildId: bigint, bridgeId: string) =>
    apiRequest<void>(`Bridge/${guildId}/${bridgeId}`, "DELETE"),

  /** Gets the communities this guild is paired with */
  getPairs: (guildId: bigint) => apiRequest<Pair[]>(`Bridge/${guildId}/pairs`),

  /** Makes a code that pairs a community on the other platform with this one */
  createPairCode: (guildId: bigint, userId: bigint) =>
    apiRequest<BridgeCode>(`Bridge/${guildId}/pairs/code`, "POST", { userId }),

  /** Pairs with the community that made a code */
  linkPair: (guildId: bigint, code: string, userId: bigint) =>
    apiRequest<Pair>(`Bridge/${guildId}/pairs/link`, "POST", { code, userId }),

  /** Replaces the approval mode and hidden channels of a pair */
  updatePairSettings: (guildId: bigint, pairId: string, settings: PairSettings) =>
    apiRequest<Pair>(`Bridge/${guildId}/pairs/${pairId}/settings`, "POST", settings),

  /** Bridges a channel here to a channel in the paired community */
  connectPair: (guildId: bigint, pairId: string, localChannelId: bigint, remoteChannelId: bigint, userId: bigint) =>
    apiRequest<PairConnectResult>(`Bridge/${guildId}/pairs/${pairId}/connect`, "POST", { localChannelId, remoteChannelId, userId }),

  /** Accepts a bridge the paired community proposed */
  acceptProposal: (guildId: bigint, pairId: string, proposalId: string, userId: bigint) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}/accept`, "POST", { userId }),

  /** Declines a bridge the paired community proposed */
  declineProposal: (guildId: bigint, pairId: string, proposalId: string, userId: bigint) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}/decline`, "POST", { userId }),

  /** Cancels a bridge this community proposed */
  cancelProposal: (guildId: bigint, pairId: string, proposalId: string) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}`, "DELETE"),

  /** Unlinks a paired community, optionally keeping the bridges made through it */
  removePair: (guildId: bigint, pairId: string, keepBridges: boolean) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}?keepBridges=${keepBridges}`, "DELETE"),
};
