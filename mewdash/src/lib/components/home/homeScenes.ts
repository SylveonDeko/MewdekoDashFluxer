import { defaultAvatarUrl } from "$lib/utils/cdn";
import { ago, type ChatScene, type ChatUser } from "$lib/components/chat-mock/fluxer/types";

const TIME = "Today at 6:12 PM";
const OK = "#00e584";

const users = {
  mewdeko: { name: "Mewdeko", avatar: "/img/Mewdeko.png", bot: true },
  renamed: { name: "Deko", avatar: "/img/Mewdeko.png", bot: true },
  deko: { name: "Deko", avatar: "/img/mascot.svg", color: "#2b2233", bot: true },
  hazel: { name: "Hazel", avatar: defaultAvatarUrl(2) },
  biscuit: { name: "Biscuit", avatar: defaultAvatarUrl(0) },
} satisfies Record<string, ChatUser>;

/** A ban appeal arriving in the staff channel, with the reactions staff decide it with. */
export const formsScene: ChatScene = {
  channel: "appeals",
  users,
  messages: [
    {
      author: "mewdeko",
      time: TIME,
      embeds: [
        {
          color: "#3498db",
          title: "New Form Submission: Ban Appeal",
          description: "Tell us what happened and why you should be let back in.",
          fields: [
            { name: "User", value: "biscuit", inline: true },
            { name: "Submitted", value: ago(240), inline: true },
            { name: "❓ Why were you banned?", value: "└─ Spamming invite links in #general." },
            { name: "❓ Why should we unban you?", value: "└─ It was a compromised account and I have reset everything since." },
          ],
          footer: "Response ID: #128 | Form ID: #4",
        },
      ],
      reactions: [
        { emoji: "✅", count: 2, me: true },
        { emoji: "❌", count: 1 },
      ],
    },
    { author: "mewdeko", time: TIME, text: "<@hazel> Approved response #128." },
  ],
};

/** The level-up post Mewdeko sends when someone reaches a new level. */
export const xpScene: ChatScene = {
  channel: "general",
  users,
  messages: [
    { author: "biscuit", time: TIME, text: "anyone up for a round of trivia later?" },
    {
      author: "mewdeko",
      time: TIME,
      embeds: [
        {
          color: "#5865f2",
          title: "Level Up!",
          description: "Congratulations <@biscuit>!\nYou've reached **Level 12**",
          thumbnail: { src: defaultAvatarUrl(0), width: 80, height: 80 },
          fields: [
            { name: "Total XP", value: "5,889", inline: true },
            { name: "Server Rank", value: "#4", inline: true },
            { name: "New Level", value: "12", inline: true },
          ],
          footer: "The Deko Tree",
          timestamp: TIME,
        },
      ],
    },
  ],
};

/** The bot taking on its own name and avatar in one server. */
export const profileScene: ChatScene = {
  channel: "bot-commands",
  users,
  messages: [
    { author: "hazel", time: TIME, text: ".setnick Deko" },
    { author: "renamed", time: TIME, embeds: [{ color: OK, description: "Bot's nickname changed to **Deko**" }] },
    { author: "hazel", time: TIME, text: ".setguildavatar https://mewdeko.tech/img/mascot.svg" },
    { author: "deko", time: TIME, embeds: [{ color: OK, description: "Successfully set the bot's guild avatar!" }] },
  ],
};
