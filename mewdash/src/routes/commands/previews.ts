import type { CommandPreview } from "./replies/chat";
import { administrationPreviews } from "./replies/administration";
import { automationPreviews } from "./replies/automation";
import { communityPreviews } from "./replies/community";
import { economyPreviews } from "./replies/economy";
import { entertainmentPreviews } from "./replies/entertainment";
import { moderationPreviews } from "./replies/moderation";
import { progressPreviews } from "./replies/progress";
import { searchesPreviews } from "./replies/searches";
import { servermanagementPreviews } from "./replies/servermanagement";
import { utilityPreviews } from "./replies/utility";

export type { CommandPreview } from "./replies/chat";
export { PREFIX } from "./replies/chat";

/** Previews keyed by lower-case command name, each a scene of the command and Mewdeko's real reply. */
export const previews: Record<string, CommandPreview> = {
  ...utilityPreviews,
  ...administrationPreviews,
  ...searchesPreviews,
  ...entertainmentPreviews,
  ...moderationPreviews,
  ...servermanagementPreviews,
  ...economyPreviews,
  ...progressPreviews,
  ...automationPreviews,
  ...communityPreviews,
};
