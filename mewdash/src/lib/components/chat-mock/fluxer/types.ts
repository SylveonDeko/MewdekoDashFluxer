// SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer).
import type { Component } from "svelte";

/** Someone who takes part in a scene. */
export interface ChatUser {
  name: string;
  avatar?: string;
  color?: string;
  bot?: boolean;
}

export interface ChatImage {
  src: string;
  width: number;
  height: number;
}

/** An embed image drawn by a component, sized like an attachment of `width` by `height`. */
export interface ChatComponentImage<Props extends Record<string, unknown> = Record<string, unknown>> {
  component: Component<Props>;
  props: Props;
  width: number;
  height: number;
}

export interface ChatEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

/** A rich embed. Text parts take the markdown subset that `parseMarkup` reads. */
export interface ChatEmbed {
  color: string;
  author?: string;
  title?: string;
  description?: string;
  fields?: ChatEmbedField[];
  image?: ChatImage | ChatComponentImage<any>;
  thumbnail?: ChatImage;
  footer?: string;
  timestamp?: string;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  me?: boolean;
}

export interface ChatTextMessage {
  kind?: "message";
  /** A key into the scene's `users`. */
  author: string;
  time: string;
  text?: string;
  embeds?: ChatEmbed[];
  /** Image files attached to the message, drawn above its embeds. */
  attachments?: ChatImage[];
  reactions?: ChatReaction[];
  /** The slash command this message answers, shown as a "used /command" line above it. */
  interaction?: ChatInteraction;
  /** Marks a reply only the person who ran the command can see. */
  ephemeral?: boolean;
  /** Rows of buttons or a select menu under the message, drawn below its embeds. */
  components?: ChatComponentRow[];
}

/** A message button. Link buttons carry an external-link mark. */
export interface ChatButton {
  label?: string;
  emoji?: string;
  style: "primary" | "secondary" | "success" | "danger" | "link";
  disabled?: boolean;
}

/** A select menu, shown closed with its placeholder or chosen option. */
export interface ChatSelect {
  placeholder: string;
  disabled?: boolean;
}

/** One row under a message: up to five buttons, or a single select menu. */
export type ChatComponentRow = { buttons: ChatButton[] } | { select: ChatSelect };

/** Who ran a slash command and which one, for the line above the bot's answer. */
export interface ChatInteraction {
  /** A key into the scene's `users`. */
  user: string;
  /** The command as typed, without the slash, e.g. `eco balance`. */
  command: string;
}

/** The system line Fluxer posts when someone pins a message. */
export interface ChatPinMessage {
  kind: "pin";
  author: string;
  time: string;
}

export type ChatMessage = ChatTextMessage | ChatPinMessage;

/** The other user of a DM, shown in the header. */
export interface ChatRecipient {
  name: string;
  avatar?: string;
  bot?: boolean;
}

export interface ChatScene {
  channel: string;
  /** Makes the scene a DM with this user. */
  dm?: ChatRecipient;
  /** The scene's participants by key. Messages name their author and `<@key>` mentions one. */
  users: Record<string, ChatUser>;
  /** The participant signed in, shown in the desktop user area. */
  self?: string;
  messages: ChatMessage[];
}

/** The context key the scene's users are shared under. */
export const chatUsersKey = Symbol("chat users");

/** Writes a Fluxer relative timestamp that renders as this many seconds ago. */
export const ago = (seconds: number) => `<t:-${seconds}:R>`;
