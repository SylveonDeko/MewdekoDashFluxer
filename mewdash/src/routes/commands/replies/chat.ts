import { defaultAvatarUrl, userAvatarStillUrl } from "$lib/utils/cdn";
import type {
  ChatEmbed,
  ChatImage,
  ChatReaction,
  ChatScene,
  ChatTextMessage,
  ChatUser,
} from "$lib/components/chat-mock/fluxer/types";

/** A command and Mewdeko's reply to it, as the bot sends it. */
export type CommandPreview = ChatScene;

/** SylveonDeko's Fluxer account, the one running every command. */
export const OWNER_ID = "1521568983961042944";

/** The Mewdeko bot's Fluxer account. */
export const BOT_ID = "1562365248344698880";

/** The cast of every Mewdeko scene. */
export const users = {
  bot: { name: "Mewdeko", avatar: userAvatarStillUrl(BOT_ID, "4aafb5f1", 128), bot: true },
  sylveon: { name: "SylveonDeko", avatar: userAvatarStillUrl(OWNER_ID, "a_186936e0", 128) },
  member: { name: "Biscuit", avatar: defaultAvatarUrl(0) },
} satisfies Record<string, ChatUser>;

/** How the bot mentions the second member, for commands that act on someone else. */
export const MEMBER = "<@member>";

/** How the bot mentions the person who ran the command. */
export const AUTHOR = "<@sylveon>";

/** The username the bot writes into footers and plain text. */
export const USERNAME = "SylveonDeko";
export const PREFIX = ".";
export const TIME = "Today at 6:12 PM";
export const WEBSITE = "https://mewdeko.tech";

/** `ColorConfig` defaults from the bot. */
export const OK = "#00e584";
export const ERROR = "#ee281f";
export const PENDING = "#faa61a";

type Content = ChatEmbed | string | { text?: string; embeds?: ChatEmbed[]; attachments?: ChatImage[] };

const message = (author: keyof typeof users, content: Content, reactions?: ChatReaction[]): ChatTextMessage => {
  const base = { author, time: TIME, ...(reactions ? { reactions } : {}) };
  if (typeof content === "string") return { ...base, text: content };
  if (!("color" in content)) return { ...base, ...content };
  return { ...base, embeds: [content] };
};

export const sylveon = (text: string) => message("sylveon", `${PREFIX}${text}`);
export const bot = (content: Content, reactions?: ChatReaction[]) => message("bot", content, reactions);

export const chat = (channel: string, ...messages: ChatTextMessage[]): ChatScene => ({ channel, users, messages });

/** A command and the bot's replies to it. */
export const reply = (input: string, ...responses: Content[]) => chat("general", sylveon(input), ...responses.map((r) => bot(r)));

/** `SendConfirmAsync`: an embed in the OK colour holding only a description. */
export const confirm = (description: string, title?: string): ChatEmbed => ({ color: OK, description, ...(title ? { title } : {}) });

/** `SendErrorAsync`: an embed in the error colour holding only a description. */
export const error = (description: string): ChatEmbed => ({ color: ERROR, description });
