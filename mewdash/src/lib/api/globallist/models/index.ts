export type GlobalListCategory =
  | "Scamming"
  | "Raiding"
  | "SpamBot"
  | "Harassment"
  | "Nsfw"
  | "Impersonation"
  | "Other";

export type GlobalListAction = "Ignore" | "Alert" | "QuarantineRole" | "Kick" | "Ban";

export type GlobalListStatus = "Pending" | "Live" | "Rejected" | "Removed";

export type GlobalListAppealStatus = "Open" | "Approved" | "Rejected";

export const GLOBAL_LIST_CATEGORIES: GlobalListCategory[] = [
  "Scamming",
  "Raiding",
  "SpamBot",
  "Harassment",
  "Nsfw",
  "Impersonation",
  "Other",
];

export const GLOBAL_LIST_ACTIONS: GlobalListAction[] = ["Ignore", "Alert", "QuarantineRole", "Kick", "Ban"];

/** Most screenshots one report can carry */
export const GLOBAL_LIST_MAX_SCREENSHOTS = 4;

/** A community's global list settings, with an action for every category */
export interface GlobalListSettings {
  enabled: boolean;
  logChannelId: bigint;
  quarantineRoleId: bigint;
  applyToExisting: boolean;
  actions: Record<GlobalListCategory, GlobalListAction>;
}

/** Changes to send, where 0 clears a channel or role */
export interface GlobalListSettingsPatch {
  enabled?: boolean;
  logChannelId?: bigint;
  quarantineRoleId?: bigint;
  applyToExisting?: boolean;
  actions?: Partial<Record<GlobalListCategory, GlobalListAction>>;
}

/** A community's reporting record and today's usage */
export interface GlobalListStanding {
  approved: number;
  rejected: number;
  blocked: boolean;
  reportsToday: number;
  dailyCap: number;
}

export interface GlobalListOverview {
  settings: GlobalListSettings;
  standing: GlobalListStanding;
}

/** One entry in a list, without its reports */
export interface GlobalListEntryItem {
  id: number;
  userId: bigint;
  category: GlobalListCategory;
  status: GlobalListStatus;
  reportCount: number;
  confirmVotes: number;
  disputeVotes: number;
  reportedByMe: boolean;
  /** True confirms, false disputes, null has not voted */
  myVote: boolean | null;
  decisionNote: string | null;
  decidedAt: string | null;
  dateAdded: string;
}

export interface GlobalListReport {
  id: number;
  guildId: bigint;
  guildName: string | null;
  category: GlobalListCategory;
  reason: string;
  links: string[];
  imageIds: number[];
  dateAdded: string;
}

export interface GlobalListVote {
  guildId: bigint;
  guildName: string | null;
  confirm: boolean;
  note: string | null;
  dateAdded: string;
}

export interface GlobalListAppeal {
  id: number;
  entryId: number;
  userId: bigint;
  category: GlobalListCategory;
  text: string;
  status: GlobalListAppealStatus;
  decisionNote: string | null;
  dateAdded: string;
}

export interface GlobalListEntryDetail {
  entry: GlobalListEntryItem;
  reports: GlobalListReport[];
  votes: GlobalListVote[];
  appeals: GlobalListAppeal[];
}

export interface GlobalListQueue {
  entries: GlobalListEntryItem[];
  appeals: GlobalListAppeal[];
}

export interface GlobalListCommunityStanding {
  guildId: bigint;
  guildName: string | null;
  approved: number;
  rejected: number;
  blocked: boolean;
  resetAt: string | null;
}

export interface GlobalListReviewer {
  userId: bigint;
  addedBy: bigint;
  dateAdded: string;
}

export interface GlobalListReviewerStatus {
  isReviewer: boolean;
  isOwner: boolean;
}

export interface GlobalListReportRequest {
  targetUserId: bigint;
  category: GlobalListCategory;
  reason: string;
  links: string[];
  /** Base64 or data URIs */
  screenshots: string[];
}

export interface GlobalListReviewRequest {
  approve: boolean;
  note?: string;
  category?: GlobalListCategory;
}
