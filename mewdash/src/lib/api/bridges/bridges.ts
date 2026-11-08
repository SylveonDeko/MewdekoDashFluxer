import { apiRequest } from "../core";
import type { Bridge, BridgeCode, BridgeCodeRequest, BridgeLinkRequest, BridgeSettings, Pair, PairConnectResult, PairSettings } from "./models";

export const bridgesApi = {
  list: (guildId: bigint) => apiRequest<Bridge[]>(`Bridge/${guildId}`),

  createCode: (guildId: bigint, request: BridgeCodeRequest) =>
    apiRequest<BridgeCode>(`Bridge/${guildId}/code`, "POST", request),

  link: (guildId: bigint, request: BridgeLinkRequest) =>
    apiRequest<Bridge>(`Bridge/${guildId}/link`, "POST", request),

  pause: (guildId: bigint, bridgeId: string) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/pause`, "POST"),

  resume: (guildId: bigint, bridgeId: string) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/resume`, "POST"),

  setAllowBots: (guildId: bigint, bridgeId: string, allow: boolean) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/allow-bots`, "POST", { allow }),

  updateSettings: (guildId: bigint, bridgeId: string, settings: BridgeSettings) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/settings`, "POST", settings),

  remove: (guildId: bigint, bridgeId: string) =>
    apiRequest<void>(`Bridge/${guildId}/${bridgeId}`, "DELETE"),

  getPairs: (guildId: bigint) => apiRequest<Pair[]>(`Bridge/${guildId}/pairs`),

  createPairCode: (guildId: bigint, userId: bigint) =>
    apiRequest<BridgeCode>(`Bridge/${guildId}/pairs/code`, "POST", { userId }),

  linkPair: (guildId: bigint, code: string, userId: bigint) =>
    apiRequest<Pair>(`Bridge/${guildId}/pairs/link`, "POST", { code, userId }),

  updatePairSettings: (guildId: bigint, pairId: string, settings: PairSettings) =>
    apiRequest<Pair>(`Bridge/${guildId}/pairs/${pairId}/settings`, "POST", settings),

  connectPair: (guildId: bigint, pairId: string, localChannelId: bigint, remoteChannelId: bigint, userId: bigint) =>
    apiRequest<PairConnectResult>(`Bridge/${guildId}/pairs/${pairId}/connect`, "POST", { localChannelId, remoteChannelId, userId }),

  acceptProposal: (guildId: bigint, pairId: string, proposalId: string, userId: bigint) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}/accept`, "POST", { userId }),

  declineProposal: (guildId: bigint, pairId: string, proposalId: string, userId: bigint) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}/decline`, "POST", { userId }),

  cancelProposal: (guildId: bigint, pairId: string, proposalId: string) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}`, "DELETE"),

  removePair: (guildId: bigint, pairId: string, keepBridges: boolean) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}?keepBridges=${keepBridges}`, "DELETE"),
};
