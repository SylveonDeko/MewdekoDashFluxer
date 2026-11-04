import { PREFIX, type CommandPreview } from "./replies/chat";
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

/**
 * The same scene as a slash command: the typed command message goes, and the bot's first reply carries the
 * "used /command" line. Scenes that can't be shown that way, such as a reply that is only a reaction on the
 * command message, come back unchanged.
 */
export function asSlashCommand(scene: CommandPreview, command: string): CommandPreview {
  const [invoke, reply, ...rest] = scene.messages;
  if (!invoke || invoke.kind === "pin" || !invoke.text?.startsWith(PREFIX) || invoke.reactions?.length) return scene;
  if (!reply || reply.kind === "pin" || reply.author === invoke.author) return scene;
  return { ...scene, messages: [{ ...reply, interaction: { user: invoke.author, command } }, ...rest] };
}

/** The scene as a text command, without the buttons and select menus only slash commands can send. */
export function asTextCommand(scene: CommandPreview): CommandPreview {
  return {
    ...scene,
    messages: scene.messages.map((message) => (message.kind === "pin" || !message.components ? message : { ...message, components: undefined })),
  };
}
