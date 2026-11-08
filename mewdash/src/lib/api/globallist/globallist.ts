// lib/api/globallist/globallist.ts
import { apiRequest } from "../core";
import type {
  GlobalListCommunityStanding,
  GlobalListEntryDetail,
  GlobalListEntryItem,
  GlobalListOverview,
  GlobalListQueue,
  GlobalListReportRequest,
  GlobalListReviewRequest,
  GlobalListReviewer,
  GlobalListReviewerStatus,
  GlobalListSettingsPatch,
} from "./models";

/**
 * Global list API for communities
 * Maps to Mewdeko.Controllers.GlobalListController
 */
export const globalListApi = {
  /** Gets the community's settings, with an action for every category, and its reporting standing */
  get: (guildId: bigint) => apiRequest<GlobalListOverview>(`GlobalList/${guildId}`),

  /** Changes settings and returns the new state */
  update: (guildId: bigint, patch: GlobalListSettingsPatch) =>
    apiRequest<GlobalListOverview>(`GlobalList/${guildId}`, "POST", patch),

  /** Reports a user; the bot answers 400 with an error name when it refuses */
  report: (guildId: bigint, request: GlobalListReportRequest) =>
    apiRequest<{ entryId: number }>(`GlobalList/${guildId}/reports`, "POST", request),

  /** Lists pending entries, with the ones this community reported marked */
  getOpen: (guildId: bigint) => apiRequest<GlobalListEntryItem[]>(`GlobalList/${guildId}/open`),

  /** Gets a pending entry with its evidence and votes */
  getEntry: (guildId: bigint, entryId: number) =>
    apiRequest<GlobalListEntryDetail>(`GlobalList/${guildId}/entries/${entryId}`),

  /** Gets one screenshot as a data URI */
  getImage: (guildId: bigint, entryId: number, imageId: number) =>
    apiRequest<{ image: string }>(`GlobalList/${guildId}/entries/${entryId}/images/${imageId}`),

  /** Confirms or disputes a pending entry */
  vote: (guildId: bigint, entryId: number, confirm: boolean, note?: string) =>
    apiRequest<void>(`GlobalList/${guildId}/entries/${entryId}/vote`, "POST", { confirm, note }),
};

/** What the review sheet needs from a review API; only owners can remove */
export interface GlobalListReviewApi {
  getEntry: (entryId: number) => Promise<GlobalListEntryDetail>;
  getImage: (entryId: number, imageId: number) => Promise<{ image: string }>;
  review: (entryId: number, request: GlobalListReviewRequest) => Promise<void>;
  reviewAppeal: (appealId: number, request: GlobalListReviewRequest) => Promise<void>;
  remove?: (entryId: number, note?: string) => Promise<void>;
}

/**
 * Global list review API for bot owners and appointed reviewers
 * Maps to Mewdeko.Controllers.GlobalListReviewController
 */
export const globalListReviewApi = {
  /** Whether the signed in user can review, and whether they are an owner */
  getMe: () => apiRequest<GlobalListReviewerStatus>("GlobalListReview/me"),

  getQueue: () => apiRequest<GlobalListQueue>("GlobalListReview/queue"),

  getLive: (userId?: bigint) =>
    apiRequest<GlobalListEntryItem[]>(`GlobalListReview/live${userId ? `?userId=${userId}` : ""}`),

  getEntry: (entryId: number) => apiRequest<GlobalListEntryDetail>(`GlobalListReview/entries/${entryId}`),

  getImage: (entryId: number, imageId: number) =>
    apiRequest<{ image: string }>(`GlobalListReview/entries/${entryId}/images/${imageId}`),

  /** Approves or rejects a pending entry */
  review: (entryId: number, request: GlobalListReviewRequest) =>
    apiRequest<void>(`GlobalListReview/entries/${entryId}/review`, "POST", request),

  /** Approving an appeal removes the entry */
  reviewAppeal: (appealId: number, request: GlobalListReviewRequest) =>
    apiRequest<void>(`GlobalListReview/appeals/${appealId}/review`, "POST", request),
};

/**
 * Global list review API for bot owners
 * Maps to Mewdeko.Controllers.GlobalListOwnerController
 */
export const globalListOwnerApi = {
  /** Pending entries and open appeals, oldest first */
  getQueue: () => apiRequest<GlobalListQueue>("GlobalListOwner/queue"),

  /** Live entries, newest first, optionally for one user */
  getLive: (userId?: bigint) =>
    apiRequest<GlobalListEntryItem[]>(`GlobalListOwner/live${userId ? `?userId=${userId}` : ""}`),

  getEntry: (entryId: number) => apiRequest<GlobalListEntryDetail>(`GlobalListOwner/entries/${entryId}`),

  getImage: (entryId: number, imageId: number) =>
    apiRequest<{ image: string }>(`GlobalListOwner/entries/${entryId}/images/${imageId}`),

  /** Approves or rejects an entry; owners can also overturn an earlier decision */
  review: (entryId: number, request: GlobalListReviewRequest) =>
    apiRequest<void>(`GlobalListOwner/entries/${entryId}/review`, "POST", request),

  /** Takes a live entry off the list */
  remove: (entryId: number, note?: string) =>
    apiRequest<void>(`GlobalListOwner/entries/${entryId}/remove`, "POST", { note }),

  /** Approving an appeal removes the entry */
  reviewAppeal: (appealId: number, request: GlobalListReviewRequest) =>
    apiRequest<void>(`GlobalListOwner/appeals/${appealId}/review`, "POST", request),

  getReviewers: () => apiRequest<GlobalListReviewer[]>("GlobalListOwner/reviewers"),

  addReviewer: (userId: bigint) =>
    apiRequest<GlobalListReviewer[]>("GlobalListOwner/reviewers", "POST", { userId }),

  removeReviewer: (userId: bigint) =>
    apiRequest<GlobalListReviewer[]>(`GlobalListOwner/reviewers/${userId}`, "DELETE"),

  getStanding: () => apiRequest<GlobalListCommunityStanding[]>("GlobalListOwner/standing"),

  /** Clears a community's record */
  resetStanding: (guildId: bigint) =>
    apiRequest<GlobalListCommunityStanding[]>(`GlobalListOwner/standing/${guildId}/reset`, "POST"),
};
