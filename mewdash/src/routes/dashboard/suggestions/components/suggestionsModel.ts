import { suggestionsApi } from "$lib/api/index.ts";

export type Named = { id: string; name: string };

export interface Cfg {
  suggestChannel: string | null;
  acceptChannel: string | null;
  denyChannel: string | null;
  considerChannel: string | null;
  implementChannel: string | null;
  minLength: number;
  maxLength: number;
  anonymous: boolean;
  voteColor: number;
  threadType: number;
  suggestEmotes: string[];
  suggestionMessage: string;
  acceptMessage: string;
  denyMessage: string;
  considerMessage: string;
  implementMessage: string;
  archiveOnAccept: boolean;
  archiveOnDeny: boolean;
  archiveOnConsider: boolean;
  archiveOnImplement: boolean;
}

export type SaveMode = "now" | "typing";
export type Change = <K extends keyof Cfg>(key: K, value: Cfg[K], mode?: SaveMode) => void;

export const MAX_LENGTH = 2000;

type Senders = { [K in keyof Cfg]: (guildId: bigint, value: Cfg[K]) => Promise<unknown> };

const channel = (value: string | null) => (value ? BigInt(value) : 0n);
const message = (value: string) => (value.trim() ? value : null);

export const senders: Senders = {
  suggestChannel: (g, v) => suggestionsApi.setSuggestChannel(g, channel(v)),
  acceptChannel: (g, v) => suggestionsApi.setAcceptChannel(g, channel(v)),
  denyChannel: (g, v) => suggestionsApi.setDenyChannel(g, channel(v)),
  considerChannel: (g, v) => suggestionsApi.setConsiderChannel(g, channel(v)),
  implementChannel: (g, v) => suggestionsApi.setImplementChannel(g, channel(v)),
  minLength: (g, v) => suggestionsApi.setMinLength(g, v),
  maxLength: (g, v) => suggestionsApi.setMaxLength(g, v),
  anonymous: (g, v) => suggestionsApi.setAnonymous(g, v),
  voteColor: (g, v) => suggestionsApi.setVoteColor(g, v),
  threadType: (g, v) => suggestionsApi.setSuggestThreadsType(g, v),
  suggestEmotes: (g, v) => suggestionsApi.setSuggestEmotes(g, v.length ? v.join(",") : null),
  suggestionMessage: (g, v) => suggestionsApi.setSuggestionMessage(g, message(v)),
  acceptMessage: (g, v) => suggestionsApi.setAcceptMessage(g, message(v)),
  denyMessage: (g, v) => suggestionsApi.setDenyMessage(g, message(v)),
  considerMessage: (g, v) => suggestionsApi.setConsiderMessage(g, message(v)),
  implementMessage: (g, v) => suggestionsApi.setImplementMessage(g, message(v)),
  archiveOnAccept: (g, v) => suggestionsApi.setArchiveOnAccept(g, v),
  archiveOnDeny: (g, v) => suggestionsApi.setArchiveOnDeny(g, v),
  archiveOnConsider: (g, v) => suggestionsApi.setArchiveOnConsider(g, v),
  archiveOnImplement: (g, v) => suggestionsApi.setArchiveOnImplement(g, v)
};

function unwrap(value: unknown): unknown {
  return value && typeof value === "object" && "data" in value ? (value as { data: unknown }).data : value;
}

function text(value: unknown): string {
  const inner = unwrap(value);
  return typeof inner === "string" && inner !== "-" && inner !== "disabled" ? inner : "";
}

function num(value: unknown, fallback: number): number {
  const inner = unwrap(value);
  const parsed = typeof inner === "number" ? inner : typeof inner === "string" ? parseInt(inner, 10) : NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
}

function id(value: unknown): string | null {
  const inner = unwrap(value);
  const raw = inner === null || inner === undefined ? "" : String(inner);
  return raw && raw !== "0" ? raw : null;
}

export async function loadConfig(guildId: bigint): Promise<Cfg> {
  const api = suggestionsApi;
  const [
    suggestChannel,
    acceptChannel,
    denyChannel,
    considerChannel,
    implementChannel,
    minLength,
    maxLength,
    anonymous,
    voteColor,
    threadType,
    suggestEmotes,
    suggestionMessage,
    acceptMessage,
    denyMessage,
    considerMessage,
    implementMessage,
    archiveOnAccept,
    archiveOnDeny,
    archiveOnConsider,
    archiveOnImplement
  ] = await Promise.all([
    api.getSuggestChannel(guildId),
    api.getAcceptChannel(guildId),
    api.getDenyChannel(guildId),
    api.getConsiderChannel(guildId),
    api.getImplementChannel(guildId),
    api.getMinLength(guildId),
    api.getMaxLength(guildId),
    api.getAnonymous(guildId),
    api.getVoteColor(guildId),
    api.getSuggestThreadsType(guildId),
    api.getSuggestEmotes(guildId),
    api.getSuggestionMessage(guildId),
    api.getAcceptMessage(guildId),
    api.getDenyMessage(guildId),
    api.getConsiderMessage(guildId),
    api.getImplementMessage(guildId),
    api.getArchiveOnAccept(guildId),
    api.getArchiveOnDeny(guildId),
    api.getArchiveOnConsider(guildId),
    api.getArchiveOnImplement(guildId)
  ]);

  return {
    suggestChannel: id(suggestChannel),
    acceptChannel: id(acceptChannel),
    denyChannel: id(denyChannel),
    considerChannel: id(considerChannel),
    implementChannel: id(implementChannel),
    minLength: num(minLength, 0),
    maxLength: num(maxLength, MAX_LENGTH),
    anonymous: unwrap(anonymous) === true,
    voteColor: num(voteColor, 0),
    threadType: num(threadType, 0),
    suggestEmotes: text(suggestEmotes)
      .split(",")
      .map(emote => emote.trim())
      .filter(Boolean),
    suggestionMessage: text(suggestionMessage),
    acceptMessage: text(acceptMessage),
    denyMessage: text(denyMessage),
    considerMessage: text(considerMessage),
    implementMessage: text(implementMessage),
    archiveOnAccept: unwrap(archiveOnAccept) === true,
    archiveOnDeny: unwrap(archiveOnDeny) === true,
    archiveOnConsider: unwrap(archiveOnConsider) === true,
    archiveOnImplement: unwrap(archiveOnImplement) === true
  };
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
