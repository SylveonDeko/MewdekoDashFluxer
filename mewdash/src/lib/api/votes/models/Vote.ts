// lib/api/votes/models/Vote.ts

export interface VoteRole {
  roleId: bigint;
  roleName: string;
  seconds: number;
}

export interface Vote {
  id: number;
  userId: bigint;
  guildId: bigint;
  botId: bigint;
  dateAdded: string | null;
  username?: string | null;
}

export interface FluxerListStatus {
  hasKey: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
}

export interface VoteSummary {
  totalVotes: number;
  votesThisMonth: number;
  uniqueVoters: number;
  recent: Array<{ userId: bigint; username?: string | null; dateAdded: string | null }>;
}

export interface VoteLeaderboardEntry {
  userId: bigint;
  voteCount: number;
  username?: string | null;
}
