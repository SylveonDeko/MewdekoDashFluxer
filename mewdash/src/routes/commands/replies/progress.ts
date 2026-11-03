import type { ChatEmbed, ChatEmbedField } from "$lib/components/chat-mock/fluxer/types";
import { ago } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, bot, chat, confirm, MEMBER, OK, reply, sylveon, users, type CommandPreview } from "./chat";

const SILVER = "#c0c7d0";
const BRONZE = "#cd7f32";
const GREEN = "#2ecc71";
const SERVER = "The Deko Tree";

const field = (name: string, value: string): ChatEmbedField => ({ name, value, inline: true });
const wide = (name: string, value: string): ChatEmbedField => ({ name, value });
const ok = (embed: Omit<ChatEmbed, "color">): ChatEmbed => ({ color: OK, ...embed });
const n = (value: number) => value.toLocaleString("en-US");
const thumb = { src: users.sylveon.avatar ?? "", width: 160, height: 160 };

/** The command message carries the reaction the bot adds to check the emoji. */
const reacted = (input: string, emoji: string, response: ChatEmbed): CommandPreview =>
  chat("general", { ...sylveon(input), reactions: [{ emoji, count: 1, me: true }] }, bot(response));

const POINTS: Record<string, number> = { Bronze: 10, Silver: 25, Gold: 50, Emerald: 100, Amethyst: 250, Champion: 500 };
const bar = (fraction: number, width = 10) => {
  const filled = Math.round(Math.min(Math.max(fraction, 0), 1) * width);
  return "▰".repeat(filled) + "▱".repeat(width - filled);
};
const done = (name: string, grade: string, description: string, seconds: number) =>
  `**${name}** · ${grade} · +${POINTS[grade]} · unlocked ${ago(seconds)}\n${description}`;
const progress = (name: string, grade: string, description: string, current: number, goal: number) =>
  `**${name}** · ${grade} · +${POINTS[grade]}\n${description}\n${bar(current / goal)} ${n(current)} / ${n(goal)}`;
const lines = (...entries: string[]) => entries.join("\n\n");

const messageLadder = lines(
  done("Breaking the Ice", "Bronze", "Send 250 messages", 2_400_000),
  done("Regular", "Bronze", "Send 1,000 messages", 1_100_000),
  progress("Chatterbox", "Silver", "Send 5,000 messages", 4812, 5000),
  progress("Conversationalist", "Silver", "Send 10,000 messages", 4812, 10000),
  progress("Town Crier", "Gold", "Send 25,000 messages", 4812, 25000),
  progress("Wordsmith", "Emerald", "Send 50,000 messages", 4812, 50000),
  progress("Living Legend", "Amethyst", "Send 100,000 messages", 4812, 100000),
  progress("Unstoppable", "Champion", "Send 250,000 messages", 4812, 250000),
);

const recentUnlocks = lines(
  done("Hey You", "Bronze", "Mention someone", 10_800),
  done("Show and Tell", "Bronze", "Share a file or image", 86_400),
  done("All Day Long", "Bronze", "Spend 24 hours in voice", 172_800),
  done("Regular", "Bronze", "Send 1,000 messages", 432_000),
  done("Tuned In", "Bronze", "Spend 5 hours in voice", 777_600),
);

const bestUnlocks = lines(
  done("Wall of Text", "Silver", "Send a message of 1,000 characters or more", 604_800),
  done("Regular", "Bronze", "Send 1,000 messages", 432_000),
  done("Breaking the Ice", "Bronze", "Send 250 messages", 2_400_000),
  done("Tuned In", "Bronze", "Spend 5 hours in voice", 777_600),
  done("All Day Long", "Bronze", "Spend 24 hours in voice", 172_800),
);

const voiceSearch = lines(
  done("Tuned In", "Bronze", "Spend 5 hours in voice", 777_600),
  done("All Day Long", "Bronze", "Spend 24 hours in voice", 172_800),
  progress("Regular Caller", "Silver", "Spend 100 hours in voice", 63, 100),
  progress("On Air", "Gold", "Spend 250 hours in voice", 63, 250),
  progress("Broadcaster", "Emerald", "Spend 500 hours in voice", 63, 500),
  progress("Voice Veteran", "Amethyst", "Spend 1,000 hours in voice", 63, 1000),
  progress("Never Hung Up", "Champion", "Spend 2,500 hours in voice", 63, 2500),
);

const globalLines = lines(
  done("Traveler", "Bronze", "Unlock achievements in 3 servers", 1_300_000),
  progress("Globetrotter", "Silver", "Unlock achievements in 5 servers", 3, 5),
  progress("Citizen of Everywhere", "Gold", "Unlock achievements in 10 servers", 3, 10),
  progress("Rising Star", "Silver", "Earn 1,000 achievement points across every server", 820, 1000),
  progress("Celebrity", "Gold", "Earn 5,000 achievement points across every server", 820, 5000),
  progress("Icon", "Champion", "Earn 25,000 achievement points across every server", 820, 25000),
  progress("Achievement Hunter", "Silver", "Unlock 100 achievements across every server", 19, 100),
  progress("Trophy Case", "Amethyst", "Unlock 500 achievements across every server", 19, 500),
);

const badgeSlots =
  "Slot 1: **Bronze Messages** · Bronze\nSlot 2: **Bronze Voice** · Bronze\nSlot 3: empty\nSlot 4: empty";

const adminLines = [
  "**Messages**",
  "Breaking the Ice · `messages_total_250` · active · 31 unlocked",
  "Regular · `messages_total_1000` · active · 24 unlocked",
  "Chatterbox · `messages_total_5000` · active · 9 unlocked",
  "Conversationalist · `messages_total_10000` · active · 5 unlocked",
  "Town Crier · `messages_total_25000` · active · 2 unlocked",
  "Busy Day · `messages_day_100` · active · 14 unlocked",
  "On a Roll · `messages_day_500` · inactive · 3 unlocked",
  "Hello World · `feat_first_message` · active · 44 unlocked",
].join("\n");

export const progressPreviews: Record<string, CommandPreview> = {
  xpsettings: reply(
    "xpsettings",
    ok({
      title: `⚙️ XP Settings for ${SERVER}`,
      fields: [
        wide(
          "📊 Basic XP Rates",
          "XP per message: **10**\nMessage cooldown: **60s**\nVoice XP per minute: **2**\nVoice timeout: **5m**\nGlobal multiplier: **1x**\nXP curve type: **Standard**\nFirst message bonus: **25 XP**",
        ),
        wide("🛠️ General Settings", "XP Gain Disabled: **False**\nExclusive Role Rewards: **False**"),
        wide("🎨 Display & Notifications", "Custom XP Card Background: **No**"),
        wide("📉 XP Decay Settings", "Decay Enabled: **False**\nInactivity Days Before Decay: **30**\nDaily Decay Percentage: **1%**"),
        wide("🚫 Exclusions", "1 excluded role(s)\n2 excluded channel(s)"),
        wide("🚀 Active Boosts", "1 active boost event(s)"),
      ],
    }),
  ),
  xpinclude: reply("xpinclude #bot-spam", confirm("Users in channel <#bot-spam> can now gain XP again.")),
  xpexclude: reply("xpexclude #bot-spam", confirm("Users in channel <#bot-spam> will no longer gain XP.")),
  xpexcludelist: reply(
    "xpexcludelist channels",
    ok({ title: "Excluded Channels (2)", description: "<#bot-spam>\n<#staff-chat>", footer: "Page 1/1" }),
  ),
  xpcompetitions: reply(
    "xpcompetitions",
    ok({
      title: "Active XP Competitions",
      fields: [wide("Weekend Grind", "Type: **MostGained**\nTime left: **2 days**")],
    }),
  ),
  xpcompetition: reply(
    "xpcompetition 7d MostGained 0 Weekend Grind",
    confirm("Created MostGained competition **Weekend Grind** lasting 1 week"),
  ),
  xpboosts: reply(
    "xpboosts",
    ok({ title: "Active XP Boost Events", fields: [wide("Weekend XP Event (2x)", "Time left: 1 hour")] }),
  ),
  xpboost: reply(
    "xpboost 2h 2 Weekend XP Event",
    confirm("Created XP boost event **Weekend XP Event** with 2x multiplier for 2 hours."),
  ),
  togglelevelupmessage: reply("togglelevelupmessage 3 false", confirm("Level-up message #3 has been disabled.")),
  textrank: reply(
    "textrank",
    "XP Statistics for SylveonDeko\nLevel: 12\nTotal XP: 9400\nLevel Progress: 340/1100 XP (30% complete)\nServer Rank: #3\nBonus XP: 500",
  ),
  rank: reply("rank", {
    text: "XP Card for SylveonDeko",
    attachments: [{ src: "/img/commands/rank.png", width: 800, height: 246 }],
  }),
  achcard: reply("achcard", {
    attachments: [{ src: "/img/commands/achcard.png", width: 1000, height: 400 }],
  }),
  achview: reply("achview Chatterbox", {
    attachments: [{ src: "/img/commands/achview.png", width: 1280, height: 500 }],
  }),
  testlevelupmessage: reply(
    "testlevelupmessage %xp.user.mention% just hit level %xp.level.new%!",
    { color: GREEN, title: "Level-Up Message Test", description: `${AUTHOR} just hit level 10!` },
  ),
  syncuserxproles: reply(
    `syncuserxproles ${MEMBER}`,
    ok({
      title: "Role Sync Complete",
      description: `Synchronized roles for ${MEMBER} (Level 12)`,
      fields: [field("Roles Added", "2"), field("Roles Removed", "0")],
    }),
  ),
  syncmyxproles: reply(
    "syncmyxproles",
    ok({
      title: "Role Sync Complete",
      description: "Your roles have been synchronized based on your XP level (12)",
      fields: [field("Roles Added", "2"), field("Roles Removed", "0")],
    }),
  ),
  syncallxproles: reply(
    "syncallxproles",
    {
      color: GREEN,
      title: "Role Synchronization Complete",
      description: "Processed 142 users in 0.5 minutes",
      fields: [
        field("Users Processed", "142"),
        field("Users with Errors", "0"),
        field("Roles Added", "37"),
        field("Roles Removed", "12"),
      ],
    },
  ),
  setxpmultiplier: reply("setxpmultiplier 1.5", confirm("XP multiplier set to 1.5x.")),
  setxpexclusive: reply(
    "setxpexclusive true",
    confirm("Exclusive Xp Roles Enabled: Users will only retain the highest level role."),
  ),
  setxpcurve: reply(
    "setxpcurve Linear",
    confirm("XP curve changed to Linear. Recalculating levels for all members, this may take some time..."),
    confirm("Successfully recalculated all levels using the Linear curve"),
  ),
  setxpcooldown: reply("setxpcooldown 60", confirm("Message XP cooldown set to 60 seconds.")),
  setxp: reply(`setxp ${MEMBER} 5000`, confirm("Set Biscuit's XP to 5000.")),
  setvoicexp: reply("setvoicexp 2", confirm("Voice XP per minute set to 2.")),
  setvoicetimeout: reply("setvoicetimeout 5", confirm("Voice XP timeout set to 5 minutes.")),
  setrolexp: reply('setrolexp "VIP Members" 1.5', confirm("Role @VIP Members XP multiplier set to 1.5x.")),
  setmessagexp: reply("setmessagexp 10", confirm("XP per message set to 10.")),
  setchannelxp: reply("setchannelxp #general 2", confirm("Channel <#general> XP multiplier set to 2x.")),
  rolerewards: reply(
    "rolerewards",
    ok({ title: "Level Role Rewards", description: "Level 5: @Regular\nLevel 10: @Veteran\nLevel 25: @Elder" }),
  ),
  rolereward: reply(
    "rolereward 10 @Veteran",
    confirm("Users will now receive the @Veteran role when they reach level 10."),
  ),
  resetxp: reply(`resetxp ${MEMBER}`, confirm("Reset Biscuit's XP to zero.")),
  removerolereward: reply("removerolereward 10", confirm("Role reward for level 10 removed.")),
  removelevelupmessage: reply("removelevelupmessage 3", confirm("Level-up message #3 has been removed.")),
  removecurrencyreward: reply("removecurrencyreward 10", confirm("Currency reward for level 10 removed.")),
  levelupplaceholders: reply(
    "levelupplaceholders",
    ok({
      title: "Level-Up Message Placeholders",
      description: "Available placeholders for custom level-up messages:",
      fields: [
        wide(
          "User Placeholders",
          "`%xp.user%` - User (respects ping settings)\n`%xp.user.mention%` - User mention (respects ping settings)\n`%xp.user.name%` - Username\n`%xp.user.displayname%` - Display name\n`%xp.user.nickname%` - Nickname (or username)\n`%xp.user.avatar%` - Avatar URL\n`%xp.user.id%` - User ID",
        ),
        wide(
          "Level Placeholders",
          "`%xp.level.old%` - Previous level\n`%xp.level.new%` - New level\n`%xp.level.current%` - Current level (same as new)\n`%xp.level.next%` - Next level\n`%xp.level.difference%` - Level increase",
        ),
        wide(
          "XP Placeholders",
          "`%xp.total%` - Total XP\n`%xp.current%` - XP in current level\n`%xp.needed%` - XP needed for next level\n`%xp.remaining%` - XP remaining to next level\n`%xp.gained%` - XP gained this session\n`%xp.progress%` - Progress percentage",
        ),
        wide(
          "Other Placeholders",
          "`%xp.rank%` - Current rank\n`%xp.rank.ordinal%` - Rank in words (first, second)\n`%xp.rank.suffix%` - Rank suffix (st, nd, rd, th)\n`%xp.guild.name%` - Server name\n`%xp.time%` - Current time\n`%xp.timestamp%` - Fluxer timestamp",
        ),
        wide(
          "Legacy Compatibility",
          "`%user%`, `%user.mention%`, `%level%`, `%xp%`, `%rank%`, `%server%`, `%guild%`",
        ),
      ],
    }),
  ),
  leveluppings: reply("leveluppings false", confirm("Level-up ping notifications have been disabled for you.")),
  levelupmessages: reply(
    "levelupmessages",
    ok({
      title: "Custom Level-Up Messages",
      fields: [
        wide("#1 ✅", "```%xp.user.mention% just reached level %xp.level.new%!```"),
        wide("#3 ❌", "```GG %xp.user.name%, level %xp.level.new% at rank %xp.rank%```"),
      ],
      footer: "Page 1/1",
    }),
  ),
  levelupchannel: reply("levelupchannel #levels", confirm("Level-up notifications will now be sent to <#levels>.")),
  levelnotif: reply("levelnotif Channel", confirm("Your level-up notifications are now set to: Channel")),
  leaderboard: reply(
    "leaderboard 1",
    ok({
      title: "XP Leaderboard",
      description:
        "#1 | SylveonDeko | Level 42 | 98500 XP\n#2 | Biscuit | Level 31 | 51200 XP\n#3 | Mochi | Level 27 | 38900 XP",
      footer: "Page 1/3",
    }),
  ),
  endcompetition: reply(
    "endcompetition 2",
    confirm("Competition 'Weekend Grind' has been ended manually. Rewards will be distributed now."),
  ),
  currencyrewards: reply(
    "currencyrewards",
    ok({ title: "Level Currency Rewards", description: "Level 5: 500 🍪\nLevel 10: 1500 🍪" }),
  ),
  currencyreward: reply("currencyreward 5 500", confirm("Users will now receive 500 🍪 when they reach level 5.")),
  competitionleaderboard: reply(
    "competitionleaderboard 2",
    ok({
      title: "Competition Leaderboard: Weekend Grind",
      description: "#1: SylveonDeko - 12,450\n#2: Biscuit - 9,870\n#3: Mochi - 6,310",
      footer: "Time left: 2 days",
    }),
  ),
  cancelboost: reply("cancelboost 3", confirm("XP boost event #3 cancelled.")),
  addxp: reply(`addxp ${MEMBER} 250`, confirm("Added 250 XP to Biscuit.")),
  addlevelupmessage: reply(
    "addlevelupmessage %xp.user.mention% just reached level %xp.level.new%!",
    confirm("Custom level-up message added successfully!"),
  ),
  addcompetitionreward: reply(
    "addcompetitionreward 2 1 xp 5000",
    confirm("Added XP reward of 5000 for position #1 in competition #2."),
  ),

  countingunban: reply(
    `countingunban ${MEMBER} #counting`,
    confirm(`${MEMBER} has been unbanned from counting in <#counting>.`),
  ),
  countingtimeout: reply(
    `countingtimeout ${MEMBER} 1h #counting`,
    confirm(`${MEMBER} has been timed out from counting in <#counting> for 1 hour.`),
  ),
  countingstatus: reply(
    "countingstatus #counting",
    ok({
      title: "Counting Status - counting",
      fields: [
        field("Current Number", "1,284"),
        field("Highest Number", "1,901"),
        field("Total Counts", "3,512"),
        field("Participants", "47"),
        field("Pattern", "Normal"),
        field("Increment", "1"),
        field("Last User", MEMBER),
        wide("Configuration", "No consecutive users\nCooldown: 3s\nReset on error"),
      ],
    }),
  ),
  countingstats: reply(
    "countingstats",
    ok({
      title: "Counting Stats - SylveonDeko in counting",
      thumbnail: thumb,
      fields: [
        field("Rank", "2"),
        field("Contributions", "412"),
        field("Current Streak", "18"),
        field("Highest Streak", "64"),
        field("Accuracy", "97.2%"),
        field("Errors", "12"),
        field("Total Numbers", "412"),
        field("Last Contribution", ago(3600)),
      ],
    }),
  ),
  countingsetup: reply(
    "countingsetup #counting 1 1",
    confirm("Counting set up successfully in <#counting>! Start counting from **1** with increment **1**."),
  ),
  countingsave: reply(
    "countingsave #counting",
    confirm("Save point created for <#counting> at number **1284** (Save ID: 7)."),
  ),
  countingrestore: reply(
    "countingrestore 7 #counting",
    confirm("Successfully restored <#counting> from save point **7**."),
  ),
  countingreset: reply(
    "countingreset #counting 0",
    confirm("Successfully reset counting in <#counting> to **0**."),
  ),
  countinglist: reply(
    "countinglist",
    ok({
      title: `Counting Channels in ${SERVER}`,
      description: "Total channels: **2**",
      fields: [
        field("<#counting>", "**Current:** 1,284 | **Total:** 3,512 | **Best:** 1,901"),
        field("<#binary-counting>", "**Current:** 101 | **Total:** 640 | **Best:** 255"),
      ],
    }),
  ),
  countingleaderboard: reply(
    "countingleaderboard",
    ok({
      title: "Counting Leaderboard - counting (Contributions)",
      description: `🥇 ${AUTHOR} - **412**\n🥈 ${MEMBER} - **380**`,
      footer: "Page 1 of 1",
    }),
  ),
  countingdisable: reply("countingdisable #counting", confirm("Counting has been disabled in <#counting>.")),
  countingconfig: reply(
    "countingconfig #counting",
    ok({
      title: "Counting Configuration - counting",
      fields: [
        field("Allow Repeats", "❌"),
        field("Cooldown (seconds)", "3"),
        field("Max Number Limit", "Unlimited"),
        field("Reset on Error", "✅"),
        field("Delete Wrong Messages", "❌"),
        field("Pattern Type", "Normal"),
        field("Number Base", "10"),
        field("Achievements", "✅"),
        field("Competitions", "❌"),
        field("Success Emote", "✅"),
        field("Error Emote", "❌"),
      ],
    }),
  ),
  countingban: reply(
    `countingban ${MEMBER} #counting 1d`,
    confirm(`${MEMBER} has been banned from counting in <#counting> for 1 day.`),
  ),
  countingsuccessmessage: reply(
    "countingsuccessmessage #counting Nice one, {user}!",
    confirm("Success message has been set for <#counting>."),
  ),
  countingmilestones: reply(
    "countingmilestones #counting 100,500,1000",
    confirm("Milestones have been set for <#counting>: 100, 500, 1000"),
  ),
  countingmilestonemessage: reply(
    "countingmilestonemessage #counting {user} hit {number}!",
    confirm("Milestone message has been set for <#counting>."),
  ),
  countingmilestonechannel: reply(
    "countingmilestonechannel #counting #milestones",
    confirm("Milestone channel has been set to <#milestones> for <#counting>."),
  ),
  countingfailurethreshold: reply(
    "countingfailurethreshold #counting 3",
    confirm("Failure threshold has been set to 3 for <#counting>."),
  ),
  countingfailuremessage: reply(
    "countingfailuremessage #counting {user} broke the count at {number}.",
    confirm("Failure message has been set for <#counting>."),
  ),
  countingfailurechannel: reply(
    "countingfailurechannel #counting #count-fails",
    confirm("Failure channel has been set to <#count-fails> for <#counting>."),
  ),
  countingcooldown: reply(
    "countingcooldown #counting 5",
    confirm("Cooldown has been set to 5 seconds for <#counting>."),
  ),

  countmodwindow: reply(
    "countmodwindow 24 #counting",
    confirm("Time window has been set to 24 hours for <#counting>."),
  ),
  countmodunpunish: reply(
    "countmodunpunish 5 #counting",
    confirm("Punishment for wrong count #5 has been removed from <#counting>."),
  ),
  countmodthreshold: reply(
    "countmodthreshold 3 #counting",
    confirm("Wrong count threshold has been set to 3 for <#counting>."),
  ),
  countmodshow: reply(
    "countmodshow #counting",
    ok({
      title: "Counting Moderation Config - #counting",
      fields: [
        field("Enabled", "✅ Yes"),
        field("Wrong Count Threshold", "3"),
        field("Time Window", "24 hours"),
        field("Punishment", "Mute"),
        field("Duration", "30 minutes"),
        field("Delete Ignored Messages", "❌ No"),
        wide("Ignore Roles", "@Moderator"),
        wide("Guild Defaults", "Enabled: ✅ | Threshold: 3 | Window: 24h | Punishment: Mute"),
      ],
    }),
  ),
  countmodreset: reply(
    "countmodreset #counting",
    confirm("Channel <#counting> has been reset to use guild defaults."),
  ),
  countmodrequired: reply(
    "countmodrequired #counting @Counters",
    ok({
      title: "Required Roles Updated",
      description: "Updated required roles for <#counting>",
      fields: [wide("Required Roles", "@Counters")],
    }),
  ),
  countmodpunishment: reply(
    "countmodpunishment AddRole 60 @Penalty #counting",
    ok({
      title: "Punishment Updated",
      description: "Set punishment for <#counting>",
      fields: [field("Punishment", "AddRole"), field("Duration", "60 minutes"), field("Role", "@Penalty")],
    }),
  ),
  countmodpunishlist: reply(
    "countmodpunishlist #counting",
    ok({
      title: "Counting Tiered Punishments - counting",
      fields: [
        field("Wrong Count #3", "Mute 30 minutes"),
        field("Wrong Count #5", "AddRole 60 minutes @Penalty"),
        field("Wrong Count #8", "Kick Permanent"),
      ],
    }),
  ),
  countmodpunish: reply(
    "countmodpunish 3 Mute 30 #counting",
    ok({
      title: "Tiered Punishment Set",
      description: "Wrong count #3 punishment configured for <#counting>",
      fields: [field("Wrong Count", "3"), field("Punishment", "Mute"), field("Duration", "30 minutes")],
    }),
  ),
  countmodnonnumbers: reply(
    "countmodnonnumbers true true #counting",
    ok({
      title: "Non-Number Message Settings Updated",
      description: "Updated non-number message settings for <#counting>",
      fields: [field("Punish Non-Numbers", "✅"), field("Delete Non-Numbers", "✅")],
    }),
  ),
  countmodignore: reply(
    "countmodignore true #counting @Moderator",
    ok({
      title: "Ignore Roles Updated",
      description: "Updated ignore settings for <#counting>",
      fields: [field("Delete Messages", "✅ Yes"), wide("Ignored Roles", "@Moderator")],
    }),
  ),
  countmodenable: reply(
    "countmodenable true #counting",
    confirm("Counting moderation has been enabled for <#counting>."),
  ),
  countmodedits: reply(
    "countmodedits true true #counting",
    ok({
      title: "Edit Protection Settings Updated",
      description: "Updated edit protection settings for <#counting>",
      fields: [field("Punish Edits", "✅"), field("Delete Edits", "✅")],
    }),
  ),
  countmoddefaults: reply(
    "countmoddefaults true 3 24 Mute 30",
    ok({
      title: "Guild Defaults Updated",
      description: `Set counting moderation defaults for ${SERVER}`,
      fields: [
        field("Enabled", "✅ Yes"),
        field("Wrong Count Threshold", "3"),
        field("Time Window", "24 hours"),
        field("Punishment", "Mute"),
        field("Duration", "30 minutes"),
      ],
    }),
  ),
  countmodclearall: reply(
    "countmodclearall #counting",
    confirm("All wrong counts cleared for <#counting>."),
  ),
  countmodclear: reply(
    `countmodclear ${MEMBER} #counting`,
    confirm(`Wrong counts cleared for ${MEMBER} in <#counting>.`),
  ),
  countmodbanned: reply(
    "countmodbanned #counting @Banned",
    ok({
      title: "Banned Roles Updated",
      description: "Updated banned roles for <#counting>",
      fields: [wide("Banned Roles", "@Banned")],
    }),
  ),

  starboardwlmode: reply(
    "starboardwlmode 1 blacklist",
    confirm("Starboard 1 is now in blacklist mode. Listed channels will be ignored."),
  ),
  starboarduserstats: reply(
    "starboarduserstats",
    ok({
      title: "SylveonDeko's Starboard Statistics",
      thumbnail: thumb,
      fields: [
        field("Messages Starred", "12"),
        field("Stars Received", "74"),
        field("Stars Given", "167"),
        field("Most Starred Users", `${MEMBER} (31 ⭐)`),
        field("Top Fans", `${MEMBER} (18 ⭐)`),
      ],
    }),
  ),
  starboardstats: reply(
    "starboardstats",
    ok({
      title: "Starboard Statistics",
      fields: [
        field("Total Starred Messages", "128"),
        field("Total Stars", "912"),
        field("Most Starred User", `${MEMBER} (214 ⭐)`),
        field("Most Active Channel", "<#general> (301 ⭐)"),
        field("Most Active Starrer", `${AUTHOR} (167 given)`),
      ],
    }),
  ),
  starboardremoveonreactionsclear: reply(
    "starboardremoveonreactionsclear 1 true",
    confirm("Posts will now be removed from starboard 1 when reactions are cleared."),
  ),
  starboardremoveondelete: reply(
    "starboardremoveondelete 1 true",
    confirm("Posts will now be removed from starboard 1 when the original message is deleted."),
  ),
  starboardremoveonbelowthreshold: reply(
    "starboardremoveonbelowthreshold 1 true",
    confirm("Posts will now be removed from starboard 1 when they fall below the threshold."),
  ),
  starboardchtoggle: reply(
    "starboardchtoggle 1 #staff-chat",
    confirm("<#staff-chat> has been added to the blacklist list for starboard 1 (Check mode can be changed with .swm)"),
  ),
  starboardallowbots: reply("starboardallowbots 1 true", confirm("Bots are now allowed for starboard 1.")),
  setstarthreshold: reply("setstarthreshold 1 5", confirm("Star threshold for starboard 1 set to 5 stars.")),
  setrepostthreshold: reply("setrepostthreshold 1 10", confirm("Repost threshold for starboard 1 set to 10.")),
  removestarboardemote: reply("removestarboardemote 1 🌟", confirm("Removed emote 🌟 from starboard 1.")),
  liststarboards: reply(
    "liststarboards",
    ok({
      title: "Starboard 1",
      description:
        "Channel: <#starboard>\nEmote: ⭐\nThreshold: 3\nAllow Bots: False\nBlacklist Mode: False\nRemove on Delete: True\nRemove on Reactions Clear: True\nRemove Below Threshold: False\nRepost Threshold: 0",
      footer: "Page 1/2",
    }),
  ),
  deletestarboard: reply("deletestarboard 2", confirm("Removed starboard configuration 2.")),
  createstarboard: reacted(
    "createstarboard #starboard ⭐ 3",
    "⭐",
    confirm("Created new starboard in <#starboard> using ⭐ with threshold of 3 stars."),
  ),
  addstarboardemote: reacted("addstarboardemote 1 🌟", "🌟", confirm("Added emote 🌟 to starboard 1.")),

  badges: reply(
    "badges",
    ok({
      author: "SylveonDeko",
      title: "Badges (3 of 38)",
      description: `${badgeSlots}\n\n**Bronze Messages** · Bronze · \`messages:bronze\`\n**Bronze Voice** · Bronze · \`voice:bronze\`\n**Silver Messages** · Silver · \`messages:silver\``,
      footer: "Page 1 of 1",
    }),
  ),
  badgeremove: reply("badgeremove 2", confirm("Emptied slot 2.")),
  badgepreview: reply("badgepreview messages:silver", {
    color: SILVER,
    title: "Silver Messages",
    description: "Silver\nUnlock a Silver Messages achievement\n\nYou own this badge.\nKey: `messages:silver`",
  }),
  badgeequip: reply("badgeequip 1 messages:silver", confirm("Put **Silver Messages** in slot 1.")),
  achxpperpoint: reply("achxpperpoint 2", confirm("Members get 2 XP for every achievement point.")),
  achtoggle: reply(
    "achtoggle",
    confirm("Members can now earn achievements. Those who already qualify get theirs quietly in the next few minutes."),
  ),
  achstats: reply(
    "achstats",
    ok({
      author: "SylveonDeko",
      title: "Tracked stats",
      fields: [
        field(
          "Messages",
          "Messages: **4,812**\nMessages today: **37**\nMessages this week: **212**\nMessages this month: **890**\nText channels: **9**",
        ),
        field("Voice", "Voice hours: **63**\nVoice channels: **4**"),
        field(
          "Activity",
          "Voice joins: **58**\nMuted hours: **2**\nReactions: **310**\nDifferent emojis: **41**\nSame emoji: **88**",
        ),
        field("Invites", "Invites: **12**"),
        field("Commands", "Commands: **204**"),
        field("Membership", "Days in server: **412**"),
        field("XP", "XP level: **12**"),
        field("Reputation", "Reputation: **5**"),
        field("Currency", "Net worth: **18,250**"),
      ],
    }),
  ),
  achsearch: reply(
    "achsearch hours in voice",
    ok({ title: 'Achievements matching "hours in voice"', description: voiceSearch }),
  ),
  achrewardxp: reply(
    "achrewardxp 500 Chatterbox",
    confirm("Rewards for **Chatterbox**: role -, 0 currency, 500 XP."),
  ),
  achrewardrole: reply(
    "achrewardrole @Chatty Chatterbox",
    confirm("Rewards for **Chatterbox**: role @Chatty, 0 currency, 500 XP."),
  ),
  achrewardcurrency: reply(
    "achrewardcurrency 1000 Chatterbox",
    confirm("Rewards for **Chatterbox**: role -, 1,000 currency, 0 XP."),
  ),
  achrewardclear: reply(
    "achrewardclear Chatterbox",
    confirm("Rewards for **Chatterbox**: role -, 0 currency, 0 XP."),
  ),
  achrevoke: reply(`achrevoke ${MEMBER} Chatterbox`, confirm(`Took **Chatterbox** from ${MEMBER}.`)),
  achreset: reply(`achreset ${MEMBER}`, confirm(`Cleared 14 achievements from ${MEMBER}.`)),
  achprivacy: reply("achprivacy Achievements OnlyMe", confirm("Only you can see your Achievements now.")),
  achnotify: reply("achnotify Dm true", confirm("Dm notifications are on for you.")),
  achmessage: reply(
    "achmessage %achievement.name% unlocked by %user%!",
    confirm("Saved the unlock message."),
  ),
  achmanage: reply(
    "achmanage",
    ok({ title: "Achievements (earning)", description: adminLines, footer: "Page 1 of 9" }),
  ),
  achlogchannel: reply("achlogchannel #achievements", confirm("Unlocks are announced in <#achievements>.")),
  achlist: reply(
    "achlist",
    ok({
      author: "SylveonDeko",
      title: "Every achievement",
      description: messageLadder,
      footer: "14 of 152 unlocked · Page 1 of 19",
    }),
  ),
  achleaderboard: reply(
    "achleaderboard",
    ok({
      title: `Achievement leaderboard for ${SERVER}`,
      description:
        "**#1** Biscuit · 1,240 points · 31 unlocked · Silver\n**#2** SylveonDeko · 285 points · 14 unlocked · Bronze",
      footer: "Sorted by points · 2 members · Page 1 of 1",
    }),
  ),
  achlatest: reply(
    "achlatest",
    ok({ author: "SylveonDeko", title: "Latest achievements", description: recentUnlocks }),
  ),
  achievements: reply("achievements", {
    color: BRONZE,
    author: "SylveonDeko",
    title: "Achievements",
    description:
      "**Bronze** rank · **285** points · #2\n14 of 87 achievements unlocked\n▰▰▰▰▰▱▱▱▱▱ 215 points to **Silver**",
    fields: [
      field("Messages", "▰▰▱▱▱▱▱▱\n6 of 28"),
      field("Voice", "▰▰▱▱▱▱▱▱\n3 of 14"),
      field("Reactions", "▰▱▱▱▱▱▱▱\n2 of 12"),
      field("Invites", "▱▱▱▱▱▱▱▱\n0 of 6"),
      field("Commands", "▰▰▱▱▱▱▱▱\n2 of 10"),
      field("Loyalty", "▰▱▱▱▱▱▱▱\n1 of 8"),
      field("Community", "▱▱▱▱▱▱▱▱\n0 of 9"),
      wide(
        "Recent unlocks",
        `**Hey You** ${ago(10_800)}\n**Show and Tell** ${ago(86_400)}\n**All Day Long** ${ago(172_800)}`,
      ),
    ],
    footer: ".achcategory <category> shows the details",
  }),
  achicon: reply("achicon Chatterbox trophy", confirm("Changed the icon of **Chatterbox**.")),
  achhighest: reply(
    "achhighest",
    ok({ author: "SylveonDeko", title: "Best achievements", description: bestUnlocks }),
  ),
  achgrant: reply(`achgrant ${MEMBER} Chatterbox`, confirm(`Gave **Chatterbox** to ${MEMBER}.`)),
  achgloballeaderboard: reply(
    "achgloballeaderboard",
    ok({
      title: "Global achievement leaderboard",
      description:
        "**#1** Biscuit · 2,310 points · 52 unlocked · Gold\n**#2** SylveonDeko · 820 points · 19 unlocked · Silver",
      footer: "Sorted by points · 2 members · Page 1 of 1",
    }),
  ),
  achglobal: reply("achglobal", {
    color: SILVER,
    author: "SylveonDeko",
    title: "Global achievements",
    description: `**Silver** rank · **820** points · 19 achievements in 3 servers\n\n${globalLines}`,
  }),
  achexcluderole: reply("achexcluderole @Muted", confirm("@Muted no longer earns achievements.")),
  achexcludechannel: reply(
    "achexcludechannel #bot-spam",
    confirm("<#bot-spam> no longer earns achievements."),
  ),
  achenable: reply("achenable Chatterbox", confirm("Activated **Chatterbox**.")),
  achdmdefault: reply(
    "achdmdefault true",
    confirm("Members get unlocks in their DMs unless they turn it off."),
  ),
  achdisable: reply(
    "achdisable Chatterbox",
    confirm("Deactivated **Chatterbox**. Members who unlocked it keep it."),
  ),
  achdelete: reply("achdelete Event Winner", confirm("Deleted **Event Winner**.")),
  achcreatereaction: reply(
    "achcreatereaction 🎉 Silver Party Starter",
    confirm("Made **Party Starter** (`custom:3`): React with 🎉"),
  ),
  achcreatephrase: reply(
    'achcreatephrase "good morning" Bronze Early Bird',
    confirm('Made **Early Bird** (`custom:2`): Say "good morning"'),
  ),
  achcreatemanual: reply(
    "achcreatemanual Gold Event Winner",
    confirm("Made **Event Winner** (`custom:4`): Handed out by the staff"),
  ),
  achcreate: reply(
    "achcreate MessagesTotal 2000 Gold Chat Champion",
    confirm("Made **Chat Champion** (`custom:1`): Reach 2,000 messages (messages)"),
  ),
  achcategorytoggle: reply(
    "achcategorytoggle Voice",
    confirm("Deactivated the Voice category. Members keep what they already unlocked."),
  ),
  achcategory: reply(
    "achcategory messages",
    ok({
      author: "SylveonDeko",
      title: "Messages",
      description: messageLadder,
      footer: "6 of 28 unlocked · Page 1 of 4",
    }),
  ),
  achannounce: reply("achannounce Auto", confirm("Unlock announcements are set to Auto.")),
};
