export interface Bridge extends BridgeSettings {
  bridgeId: string;
  channelId: bigint;
  channelName: string;
  platform: string;
  remoteGuildId: bigint;
  remoteGuildName: string;
  remoteChannelId: bigint;
  remoteChannelName: string;
  paused: boolean;
  allowBots: boolean;
  dateAdded: string;
  pairId: string | null;
}

export interface BridgeCode {
  code: string;
  expiresAt: string;
}

export interface BridgeCodeRequest {
  channelId: bigint;
  userId: bigint;
}

export interface BridgeLinkRequest {
  code: string;
  channelId: bigint;
  userId: bigint;
}

export type BridgeDirection = "Both" | "SendOnly" | "ReceiveOnly";

export interface BridgeSettings {
  direction: BridgeDirection;
  allowedRoleIds: bigint[];
  blockedRoleIds: bigint[];
  blockedUserIds: bigint[];
  minMemberAgeMinutes: number;
  blockInvites: boolean;
  useWordFilter: boolean;
  nameFormat: string;
}

export type PairApprovalMode = "Approve" | "Auto";

export interface PairChannel {
  id: bigint;
  name: string;
  category: string | null;
}

export interface PairLocalChannel extends PairChannel {
  shared: boolean;
}

export interface PairProposal {
  proposalId: string;
  localChannelId: bigint;
  localChannelName: string;
  remoteChannelId: bigint;
  remoteChannelName: string;
  dateAdded: string;
}

export interface Pair {
  pairId: string;
  remoteGuildId: bigint;
  remoteGuildName: string;
  approvalMode: PairApprovalMode;
  hiddenChannelIds: bigint[];
  localChannels: PairLocalChannel[];
  remoteChannels: PairChannel[];
  incomingProposals: PairProposal[];
  outgoingProposals: PairProposal[];
  dateAdded: string;
}

export interface PairSettings {
  approvalMode: PairApprovalMode;
  hiddenChannelIds: bigint[];
}

export interface PairConnectResult {
  status: "connected" | "proposed";
  proposalId?: string;
}
