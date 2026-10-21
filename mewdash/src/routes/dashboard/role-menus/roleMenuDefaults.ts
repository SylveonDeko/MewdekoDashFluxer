import * as cdn from "$lib/utils/cdn";
import { RoleMenuMode } from "$lib/api/rolemenus/models";

/** Name used when a menu is saved with a blank name. Mirrors rolemenu_default_name. */
export const DEFAULT_NAME = "Pick your roles";

/** First line of the default message. Mirrors rolemenu_default_description. */
export const DEFAULT_DESCRIPTION = "React below to pick your roles. Take your reaction off to give a role up.";

/** Most menus a server can have. */
export const MAX_MENUS = 50;

/** Most options a menu can hold. */
export const MAX_OPTIONS = 20;

/** Longest menu name. */
export const NAME_LENGTH = 100;

/** Longest option name. */
export const LABEL_LENGTH = 80;

/** Longest option description. */
export const DESCRIPTION_LENGTH = 100;

/** One editable option in the editor. Snowflakes are kept as strings until the request is built. */
export interface RoleMenuOptionDraft {
  /** Stable local key for keyed lists */
  key: string;

  /** Server option ID to keep, or null for a new option */
  id: number | null;

  /** Role ID, or null until a role is picked */
  roleId: string | null;

  /** Text on the option, blank for the role name */
  label: string;

  /** Unicode emoji or custom emoji text, or null */
  emoji: string | null;

  /** Optional description */
  description: string;


  /** Problem reported by the bot for the saved role, cleared when the role changes */
  problem: string | null;
}

/** Counter behind {@link newOptionKey}. */
let optionKeyCounter = 0;

/** A fresh local key for a new option row. */
export function newOptionKey(): string {
  optionKeyCounter += 1;
  return `opt-${Date.now().toString(36)}-${optionKeyCounter}`;
}

/** The fields of an option that the preview and default message need. */
export interface PreviewOption {
  /** Text typed for the option, possibly blank */
  label: string;

  /** Name of the option's role, used when the label is blank */
  roleName?: string | null;

  /** Unicode emoji or custom emoji text */
  emoji?: string | null;

  /** Optional description */
  description?: string | null;
}

/**
 * The label the bot stores for an option: the trimmed label, or the role name when blank.
 * @param option The option
 */
export function effectiveLabel(option: PreviewOption): string {
  const label = option.label?.trim();
  if (label) return label;
  return (option.roleName ?? "").trim().slice(0, LABEL_LENGTH);
}

/**
 * The trimmed description, or null when blank.
 * @param option The option
 */
function effectiveDescription(option: PreviewOption): string | null {
  const description = option.description?.trim();
  return description ? description : null;
}

/**
 * The trimmed emoji text, or null when blank.
 * @param option The option
 */
function effectiveEmoji(option: PreviewOption): string | null {
  const emoji = option.emoji?.trim();
  return emoji ? emoji : null;
}

/** Emojis the bot gives to options without one, in the order it hands them out. */
const NUMBER_EMOJIS = [
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}️⃣`),
  "\u{1F51F}",
  ...Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x1f1e6 + i))
];

/**
 * One line per option with the emoji members react with, filling in the number emojis
 * the bot hands out when an option has none.
 * @param options The options in display order
 */
function optionLines(options: PreviewOption[]): string {
  const taken = new Set(options.map(effectiveEmoji).filter((emoji): emoji is string => !!emoji));
  let next = 0;
  return options.map((option) => {
    let emoji = effectiveEmoji(option);
    if (!emoji) {
      while (next < NUMBER_EMOJIS.length - 1 && taken.has(NUMBER_EMOJIS[next])) next += 1;
      emoji = NUMBER_EMOJIS[next];
      taken.add(emoji);
      next += 1;
    }
    const description = effectiveDescription(option);
    return emoji + " **" + effectiveLabel(option) + "**" + (description ? ": " + description : "");
  }).join("\n");
}

/**
 * Builds the default message the bot posts when a menu has no message of its own:
 * the menu name as the title, an intro line and one line per option.
 * @param name The menu name
 * @param options The options in display order
 */
export function buildDefaultEmbed(name: string, options: PreviewOption[]) {
  return {
    title: (name.trim() || DEFAULT_NAME).slice(0, 256),
    description: (DEFAULT_DESCRIPTION + "\n\n" + optionLines(options)).slice(0, 4096)
  };
}

/**
 * Builds the option list the bot adds after a custom message.
 * @param options The options in display order
 */
export function buildOptionsEmbed(options: PreviewOption[]) {
  return { description: optionLines(options).slice(0, 4096) };
}

/**
 * Clamps a menu's limits the same way the bot does before saving.
 * @param mode Pick any or pick one
 * @param min Requested minimum
 * @param max Requested maximum, 0 for no limit
 * @param optionCount Number of options on the menu
 * @returns The clamped minimum and maximum
 */
export function clampLimits(mode: number, min: number, max: number, optionCount: number): { min: number; max: number } {
  if (mode === RoleMenuMode.PickOne) return { min: min >= 1 ? 1 : 0, max: 1 };

  const count = Math.max(optionCount, 0);
  const clampedMax = Math.min(Math.max(max, 0), count);
  const clampedMin = Math.min(Math.max(min, 0), clampedMax === 0 ? count : clampedMax);
  return { min: clampedMin, max: clampedMax };
}

/**
 * Image URL for custom emoji text such as <:name:id>, or null for a unicode emoji.
 * @param emoji The stored emoji text
 */
export function emojiImageUrl(emoji: string | null | undefined): string | null {
  if (!emoji) return null;
  const match = emoji.match(/^<(a?):[^:]+:(\d+)>$/);
  if (!match) return null;
  return cdn.emojiUrl(match[2], 48);
}

/**
 * Turns a stored message source into the embed builder's value: JSON is parsed, other text
 * becomes plain content, and an empty source becomes an empty object.
 * @param raw The stored message source
 */
export function parseMessageSource(raw: string | null | undefined): Record<string, any> {
  if (!raw || !raw.trim()) return {};
  if (raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : { content: raw };
    } catch {
      return { content: raw };
    }
  }
  return { content: raw };
}

/**
 * Pulls the parts a preview renders out of an embed builder value, accepting the older
 * plainText and single embed keys the bot also understands.
 * @param value The embed builder value
 */
export function messageParts(value: unknown): { content: string; embeds: any[] } {
  if (!value || typeof value !== "object") {
    return { content: typeof value === "string" ? value : "", embeds: [] };
  }

  const source = value as Record<string, any>;
  const content = typeof source.content === "string"
    ? source.content
    : typeof source.plainText === "string" ? source.plainText : "";
  const rawEmbeds = Array.isArray(source.embeds) ? source.embeds : source.embed ? [source.embed] : [];
  const embeds = rawEmbeds
    .filter((embed: unknown) => embed && typeof embed === "object")
    .map((embed: Record<string, any>) => ({
      ...embed,
      color: typeof embed.color === "number" ? `#${embed.color.toString(16).padStart(6, "0")}` : embed.color
    }));
  return { content, embeds };
}

/**
 * Whether an embed builder value holds anything that would show in Discord.
 * @param value The embed builder value
 */
export function hasMessageContent(value: unknown): boolean {
  const { content, embeds } = messageParts(value);
  if (content.trim()) return true;
  return embeds.some((embed) =>
    embed.title?.trim?.() || embed.description?.trim?.() || embed.fields?.length > 0 ||
    embed.author?.name?.trim?.() || embed.footer?.text?.trim?.() || embed.image?.url?.trim?.() ||
    embed.thumbnail?.url?.trim?.());
}

/**
 * Serializes an embed builder value for saving: JSON when it has something to show,
 * otherwise an empty string so the bot posts the default message.
 * @param value The embed builder value
 */
export function serializeMessage(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) return "";
  return hasMessageContent(value) ? JSON.stringify(value) : "";
}
