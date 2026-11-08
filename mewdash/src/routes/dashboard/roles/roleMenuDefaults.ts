import { RoleMenuMode } from "$lib/api/rolemenus/models";

/** Name used when a menu is saved with a blank name. Mirrors rolemenu_default_name. */
export const DEFAULT_NAME = "Pick your roles";

/** First line of the default message. Mirrors rolemenu_default_description. */
export const DEFAULT_DESCRIPTION = "React below to pick your roles. Take your reaction off to give a role up.";

/** Most options a menu can hold. */
export const MAX_OPTIONS = 25;

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

  /** Seconds this role lasts, 0 to follow the menu */
  tempRoleSeconds: number;

  /** Most members who can hold the role, 0 for no limit */
  maxHolders: number;

  /** Problem reported by the bot for the saved role, cleared when the role changes */
  problem: string | null;
}

/** Seconds in each unit a duration field offers, smallest first. */
export const DURATION_UNITS = [
  { id: "minutes", seconds: 60 },
  { id: "hours", seconds: 3600 },
  { id: "days", seconds: 86400 }
] as const;

/**
 * Splits a number of seconds into the largest unit that divides it evenly.
 * @param seconds Total seconds, 0 for none
 */
export function splitDuration(seconds: number): { amount: number; unit: string } {
  if (seconds <= 0) return { amount: 0, unit: "hours" };
  const unit = [...DURATION_UNITS].reverse().find((u) => seconds % u.seconds === 0) ?? DURATION_UNITS[0];
  return { amount: Math.max(Math.round(seconds / unit.seconds), 1), unit: unit.id };
}

/**
 * Turns an amount and unit into seconds.
 * @param amount How many units, 0 for none
 * @param unit The unit id
 */
export function joinDuration(amount: number, unit: string): number {
  const size = DURATION_UNITS.find((u) => u.id === unit)?.seconds ?? 3600;
  return Math.max(Math.floor(amount), 0) * size;
}

/** Longest temporary role, a year in seconds. */
export const MAX_TEMP_SECONDS = 365 * 24 * 60 * 60;

/**
 * Formats an RGB number as a hex colour.
 * @param color 24 bit RGB value
 */
export function colorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

/**
 * Converts a UTC time without a zone, as the bot returns it, to the value a local date and time input takes.
 * @param utc The UTC time text, or null
 */
export function utcToLocalInput(utc: string | null | undefined): string {
  if (!utc) return "";
  const date = new Date(utc.endsWith("Z") ? utc : `${utc}Z`);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Converts a local date and time input value to an ISO time in UTC.
 * @param local The input value, or an empty string
 */
export function localInputToUtc(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

/**
 * Builds the default message the bot posts when a menu has no message of its own:
 * the menu name as the title and one line per option.
 * @param name The menu name
 * @param options The options in display order
 */
export function buildDefaultEmbed(name: string, options: PreviewOption[]) {
  const lines = options.map((option) => {
    const emoji = effectiveEmoji(option);
    const description = effectiveDescription(option);
    return (emoji ? emoji + " " : "") + "**" + effectiveLabel(option) + "**" +
      (description ? ": " + description : "");
  });

  return {
    title: (name.trim() || DEFAULT_NAME).slice(0, 256),
    description: (DEFAULT_DESCRIPTION + "\n\n" + lines.join("\n")).slice(0, 4096)
  };
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
  if (mode !== RoleMenuMode.PickAny) return { min: 0, max: 0 };

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
  return `https://cdn.discordapp.com/emojis/${match[2]}.${match[1] === "a" ? "gif" : "png"}?size=48`;
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
 * Serializes an embed builder value for saving, or an empty string when it has nothing to show.
 * @param value The embed builder value
 */
export function serializeMessage(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) return "";
  return hasMessageContent(value) ? JSON.stringify(value) : "";
}
