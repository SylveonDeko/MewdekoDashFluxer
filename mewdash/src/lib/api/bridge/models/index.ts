/** A channel bridge, as the bot returns it */
export interface Bridge extends BridgeSettings {
  bridgeId: string;
  channelId: bigint;
  channelName: string | null;
  remoteGuildId: bigint;
  remoteChannelId: bigint;
  remoteGuildName: string;
  remoteChannelName: string;
  platform: string;
  paused: boolean;
  allowBots: boolean;
  dateAdded: string;
  pairId: string | null;
}

/** A link code made for a channel */
export interface BridgeCode {
  code: string;
  expiresAt: string;
}

/** Which way messages travel across a bridge */
export type BridgeDirection = "Both" | "SendOnly" | "ReceiveOnly";

/** The relay rules of a bridge */
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

/** Whether channel bridges proposed by the paired community need approval */
export type PairApprovalMode = "Approve" | "Auto";

/** A channel offered by one side of a pair */
export interface PairChannel {
  id: bigint;
  name: string;
  category: string | null;
}

/** A channel here, with whether the paired community can see it */
export interface PairLocalChannel extends PairChannel {
  shared: boolean;
}

/** A proposed channel bridge waiting for approval */
export interface PairProposal {
  proposalId: string;
  localChannelId: bigint;
  localChannelName: string;
  remoteChannelId: bigint;
  remoteChannelName: string;
  dateAdded: string;
}

/** Two communities linked once, so channels can be bridged without codes */
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

/** The sharing rules of a pair */
export interface PairSettings {
  approvalMode: PairApprovalMode;
  hiddenChannelIds: bigint[];
}

/** What connecting a channel pair did */
export interface PairConnectResult {
  status: "connected" | "proposed";
  proposalId?: string;
}
