import { ago } from "$lib/components/chat-mock/fluxer/types";
import { OK, USERNAME, MEMBER, bot, chat, confirm, error, reply, sylveon, users, type CommandPreview } from "./chat";

/** `ReplyConfirmAsync`: the confirm embed with the invoker's name in bold in front. */
const rc = (text: string) => confirm(`**${USERNAME}** ${text}`);

/** `ReplyErrorAsync`: the error embed with the invoker's name in bold in front. */
const re = (text: string) => error(`**${USERNAME}** ${text}`);

const AVATAR = { src: users.sylveon.avatar!, width: 512, height: 512 };
const SNIPE_ID = "1520000000000000001";
const REPEATER =
  "<#general>\n`Trigger Mode` **TimeInterval**\n`Interval` **01h 00m**\n`Executes in:` **01h 00m**\n`Display Count` **0**\n`Message:` Remember to read the rules";

const snipe = (said: string, text: string, footer: string) => ({
  color: OK,
  author: `SylveonDeko ${said}`,
  description: text,
  footer,
});

const deleted = snipe("said:", "this server is getting a new name soon", "Snipe requested by SylveonDeko || Message deleted 3 minutes ago || Invite me!");
const edited = snipe("originally said:", "meeting is at 5pm", "Snipe requested by SylveonDeko || Message deleted 2 minutes ago || Invite me!");

const deletedPage = snipe("said:", "this server is getting a new name soon", "Page 1/3");
const editedPage = snipe("originally said:", "meeting is at 5pm", "Page 1/3");

export const utilityPreviews: Record<string, CommandPreview> = {
  ping: reply("ping", confirm("Bot Ping 182ms\nBot Latency 41ms\nRedis Ping 312ns")),
  vote: reply(
    "vote",
    confirm("Vote here for Mewdeko!\n[Vote Link](https://top.gg/bot/752236274261426212)\nMake sure to join the support server! \n[Link](https://mewdeko.tech/support)"),
  ),
  vcheck: reply("vcheck https://mewdeko.tech", {
    color: OK,
    description: "https://www.virustotal.com/gui/url/9f2c1a7d4e",
    fields: [
      { name: "Virus Positives", value: "0", inline: true },
      { name: "Number of scans", value: "89", inline: true },
    ],
  }),
  userid: reply("userid", rc("🆔 of the user **SylveonDeko** is `1521568983961042944`")),
  roleid: reply("roleid Moderator", rc("🆔 of the role **Moderator** is `1520000000000000042`")),
  channelid: reply("channelid", rc("🆔 of this channel is `1520000000000000007`")),
  serverid: reply("serverid", rc("🆔 of this server is `1520000000000000003`")),
  channeltopic: reply("channeltopic", confirm("Welcome to The Deko Tree! Be kind and keep it on topic.", "Channel topic")),
  traceroute: reply("traceroute mewdeko.tech", {
    color: OK,
    description: "192.168.1.1\n10.20.0.1\n172.67.74.152",
  }),
  pingip: reply("pingip 1.1.1.1 2", {
    embeds: [
      { color: OK, title: "Ping #1", description: "Address: 1.1.1.1\nLatency: 12ms" },
      { color: OK, title: "Ping #2", description: "Address: 1.1.1.1\nLatency: 11ms" },
    ],
  }),
  timestamp: reply("timestamp UTC 2026-11-04 18:00 R", rc(`<t:7200:R> (\`<t:1793728800:R>\`)`)),
  stats: reply("stats", {
    color: OK,
    author: "Mewdeko v8",
    fields: [
      { name: "Authors", value: "[SylveonDeko](https://github.com/SylveonDeko)" },
      { name: "Commands ran", value: "15/5s" },
      { name: "Command Count", value: "1480" },
      { name: "Library", value: "Fluxer.Net 4.3.0" },
      { name: "Owner IDs", value: "<@sylveon>" },
      { name: "Memory", value: "809 MB resident\n181 MB managed\n291 MB committed\nServer, DATAS default, 32 cores" },
      { name: "Cache", value: "3,034 members\n371 channels\n318 roles" },
      { name: "Uptime", value: "3 hours\n45 minutes" },
      { name: "Servers", value: "7 Servers" },
    ],
  }),
  invite: reply("invite", {
    color: OK,
    fields: [
      {
        name: "Invite Link",
        value: "[Invite Link](https://web.fluxer.app/oauth2/authorize?client_id=1520000000000000000&scope=bot&permissions=66186303)",
      },
      { name: "Website/Docs", value: "https://mewdeko.tech" },
      { name: "Support Server", value: "https://fluxer.gg/GQuFOiBV" },
    ],
  }),
  say: reply("say Welcome to The Deko Tree!", "Welcome to The Deko Tree!"),
  owoify: reply("owoify hello friend, how are you", "henwo fwend, how awe you"),
  roll: reply("roll 2d6+3", {
    color: OK,
    description: "Total: **12**",
    fields: [{ name: "2d6", value: "4,5" }],
    footer: "Page 1/1",
  }),
  debugembed: chat(
    "general",
    sylveon('debugembed {"title":"Welcome","description":"Glad you are here"}'),
    bot({ color: OK, title: "Welcome", description: "Glad you are here" }),
    bot({
      color: OK,
      title: "Embed Successfully Parsed",
      description: "`PlainText Length:` ***0***\n`Embed Count:` ***1***",
      footer: "Execution Time: 00:00:00.0012345",
    }),
  ),
  snipeset: reply("snipeset enable", rc("Sniping is now `Enabled`")),
  snipe: reply("snipe", deleted),
  snipelist: reply("snipelist 3", deletedPage),
  editsnipe: reply("editsnipe", edited),
  editsnipelist: reply("editsnipelist 3", editedPage),
  roles: reply("roles", {
    color: OK,
    title: "Guild Roles List",
    description: `@Moderator | ${SNIPE_ID} | 3\n@Staff | 1520000000000000002 | 9\n@Member | 1520000000000000004 | 412`,
    footer: "Page 1/1",
  }),
  rolepermlist: reply("rolepermlist ManageMessages", {
    color: OK,
    title: "Roles with the specified permissions",
    fields: [{ name: "Moderator", value: `\`Id\`: ${SNIPE_ID}\n\`Mention\`: @Moderator\n\`Users\`: 3` }],
    footer: "Page 1/1",
  }),
  inrole: reply("inrole Moderator", {
    color: OK,
    title: "**List of users in **Moderator** role** - 2",
    description: "SylveonDeko `1521568983961042944`\nBiscuit `1520000000000000011`",
    fields: [{ name: "User Stats", value: "🟢 1\n🔴 0\n🟡 1\n⚫ 0" }],
    footer: "Page 1/1",
  }),
  inroles: reply("inroles Moderator Staff", {
    color: OK,
    title: "**Users in the roles: Moderator | Staff - 2**",
    description: "SylveonDeko\nBiscuit",
  }),
  calculate: reply("calculate 2*(3+4)^2", confirm("98", "⚙ Result")),
  sym: reply("sym (x+1)^2", confirm("1 + 2*x + x^2", "⚙ Symbolic Result")),
  calcops: reply(
    "calcops",
    confirm(
      "Use `.calc` with these operations:\n+, -, *, /, ^, sqrt, abs, sin, cos, tan, asin, acos, atan, log, ln, exp, floor, ceiling, round",
      "Available Calculator Operations",
    ),
  ),
  convertunits: reply("convertunits km mi 10", confirm("10 km is equal to 6.2137 mi")),
  convertlist: reply("convertlist", {
    color: OK,
    title: "Units which can be used by the converter",
    fields: [
      { name: "Length", value: "cm, ft, in, km, m, mi, mm, yd" },
      { name: "Mass", value: "g, kg, lb, mg, oz" },
      { name: "Temperature", value: "C, F, K" },
      { name: "Volume", value: "gal, l, ml" },
    ],
  }),
  previewlinks: reply("previewlinks yes", confirm("Link previews are now enabled!")),
  verboseerror: reply("verboseerror true", rc("Incorrectly used commands will now show errors.")),
  linkfix: reply("linkfix", rc("Link fixing is on. Links to supported sites get a reply with a copy that embeds properly.")),
  linkfixhost: reply("linkfixhost twitter fixupx.com", rc("Twitter/X links now go through fixupx.com.")),
  linkfixes: reply("linkfixes", {
    color: OK,
    title: "Link Fixing",
    description:
      "Link fixing is on.\n\n**Twitter/X**: fxtwitter.com (on)\n**Instagram**: vxinstagram.com (on)\n**TikTok**: tnktok.com (on)\n**Reddit**: vxreddit.com (off)\n**Pinterest**: pinterestez.com (on)\n**Bluesky**: fxbsky.app (on)\n**Pixiv**: phixiv.net (on)",
  }),
  userinfo: reply("userinfo", {
    color: OK,
    fields: [
      { name: "Username", value: "SylveonDeko" },
      { name: "User Id", value: "1521568983961042944" },
      { name: "User Type", value: "Administrator" },
      { name: "Joined Server", value: ago(31536000) },
      { name: "Joined Fluxer", value: ago(63072000) },
      { name: "Role Count", value: "3" },
    ],
    image: AVATAR,
    footer: "ℹ️ More Info",
  }),
  avatar: reply("avatar", {
    color: OK,
    fields: [
      { name: "Username", value: "SylveonDeko", inline: true },
      { name: "Guild Avatar Url", value: "[Link](https://fluxerusercontent.com/avatars/1521568983961042944/a_186936e0.webp?size=2048)", inline: true },
    ],
    image: AVATAR,
  }),
  fetch: reply("fetch 1521568983961042944", {
    color: OK,
    title: "info for fetched user",
    fields: [
      { name: "Username", value: "SylveonDeko" },
      { name: "Created At", value: ago(63072000) },
      { name: "Public Flags", value: "None" },
    ],
    image: AVATAR,
  }),
  serverinfo: reply("serverinfo", {
    color: OK,
    author: "Server info",
    title: "The Deko Tree",
    fields: [
      { name: "Id", value: "1520000000000000003" },
      { name: "Owner", value: "<@sylveon>" },
      { name: "Total Users", value: "412" },
      { name: "Created On", value: ago(63072000) },
    ],
  }),
  channelinfo: reply("channelinfo", {
    color: OK,
    title: "general",
    description: "Welcome to The Deko Tree! Be kind and keep it on topic.",
    fields: [
      { name: "Id", value: "1520000000000000007" },
      { name: "Created at", value: ago(63072000) },
      { name: "Users", value: "412" },
      { name: "NSFW", value: "False" },
      { name: "Slowmode Interval", value: "5 seconds" },
      { name: "Default Thread Archive Duration", value: "1440" },
    ],
  }),
  vinfo: reply("vinfo Lounge", {
    color: OK,
    title: "Lounge",
    fields: [
      { name: "Users", value: "3" },
      { name: "Created On", value: "10/12/2026 14:03:11 +00:00" },
      { name: "Bitrate", value: "64000" },
      { name: "User Limit", value: "Infinite" },
      { name: "Channel ID", value: "1520000000000000009" },
    ],
  }),
  rinfo: reply("rinfo Moderator", {
    color: "#1f8b4c",
    title: "Moderator",
    fields: [
      { name: "Users in role", value: "3" },
      { name: "Is Mentionable", value: "True" },
      { name: "Is Hoisted", value: "True" },
      { name: "Color", value: "#1f8b4c" },
      { name: "Permissions", value: "ViewChannel,SendMessages,ManageMessages,KickMembers" },
      { name: "Creation Date", value: ago(31536000) },
      { name: "Position", value: "5" },
      { name: "ID", value: SNIPE_ID },
    ],
  }),
  remind: reply("remind me 2h drink water", confirm("⏰ I will remind **1521568983961042944** to **drink water** <t:7200:R>")),
  remindlist: reply("remindlist", {
    color: OK,
    title: "List of reminders",
    fields: [
      {
        name: "#1 20:12 2026-11-03 UTC (in 1h 59m)",
        value: "`Target:` DM\n`TargetId:` 1521568983961042944\n`Message:` drink water",
      },
    ],
    footer: "Page 1/1",
  }),
  reminddelete: reply("reminddelete 1", re("Reminder #1 was deleted.")),
  quoteadd: reply("quoteadd hello Welcome to The Deko Tree!", rc("Quote #`7` added.")),
  quoteprint: reply("quoteprint hello", "`#7` 📣 Welcome to The Deko Tree!"),
  quoteid: reply("quoteid 7", "`#7 added by SylveonDeko` 🗯️ hello:\nWelcome to The Deko Tree!"),
  quotesearch: reply("quotesearch hello welcome", "`#7` 💬 hello:  Welcome to The Deko Tree!"),
  quoteshow: reply("quoteshow 7", {
    color: OK,
    title: "Quote #7",
    fields: [
      { name: "Trigger", value: "HELLO" },
      { name: "Response", value: "Welcome to The Deko Tree!" },
    ],
    footer: "Created by SylveonDeko (1521568983961042944)",
  }),
  listquotes: reply("listquotes", confirm("`#7` **HELLO**  by SylveonDeko\n`#9` **RULES**  by Biscuit", "Page 1 of quotes")),
  quotedelete: reply("quotedelete 7", confirm("Quote #7 deleted.")),
  delallquotes: reply("delallquotes hello", rc("Deleted all quotes with **HELLO** keyword.")),
  quoteimport: reply("quoteimport", rc("Successfully imported 12 quotes. 0 quotes failed to import.")),
  alias: reply("alias hi say Hello there", rc("Typing `hi` will now be an alias of `say Hello there`.")),
  aliaslist: reply("aliaslist", confirm("`hi` => `say Hello there`\n`rules` => `quoteprint rules`", "List of aliases")),
  aliasesclear: reply("aliasesclear", rc("All 2 aliases on this server have been removed.")),
  embedsave: reply('embedsave welcome {"title":"Welcome"}', rc("✅ Embed template `welcome` saved successfully!")),
  guildembedsave: reply('guildembedsave rules {"title":"Rules"}', rc("✅ Guild embed template `rules` saved successfully!")),
  embedlist: reply("embedlist", rc("📝 Your saved embed templates:\n• welcome\n• announcement")),
  guildembedlist: reply("guildembedlist", rc("📝 Guild embed templates:\n• rules")),
  embeddelete: reply("embeddelete welcome", rc("✅ Embed template `welcome` deleted successfully!")),
  guildembeddelete: reply("guildembeddelete rules", rc("✅ Guild embed template `rules` deleted successfully!")),
  embedpreview: reply("embedpreview welcome", { color: OK, title: "Welcome", description: "Glad you are here" }),
  aichannel: reply("aichannel #ai-chat", confirm("AI configured to use channel <#ai-chat>")),
  aimodel: reply("aimodel claude claude-sonnet-4-20250514", confirm("AI model set to claude-sonnet-4-20250514")),
  aiwebhook: reply("aiwebhook Mewdeko", confirm("AI webhook configured successfully.")),
  aicustomembed: reply('aicustomembed {"description":"%ai.response%"}', confirm("Custom embed template set.")),
  aikey: chat(
    "general",
    sylveon("aikey"),
    bot(confirm("Send your AI API key as your next message within 60 seconds. I will delete it right away.")),
    { ...sylveon("aikey"), text: "sk-ant-api03-xxxxxxxxxxxx" },
    bot(confirm("API key updated for 2")),
  ),
  aiprompt: reply("aiprompt You are a friendly assistant for The Deko Tree.", confirm("System prompt updated successfully")),
  aiwebsearch: reply("aiwebsearch true", confirm("Web search has been enabled for AI responses.")),
  aiconfig: reply("aiconfig", {
    color: OK,
    title: "AI Configuration",
    description: "Enabled: True\nChannel: <#ai-chat>\nProvider: 2\nModel: claude-sonnet-4-20250514\nTotal Tokens Used: 18420",
    fields: [{ name: "Web Search", value: "✅ Enabled", inline: true }],
  }),
  addautopublish: reply("addautopublish #announcements", rc("Messages in <#announcements> will now be auto published.")),
  removeautopublish: reply("removeautopublish #announcements", rc("Messages in <#announcements> will no longer be auto published.")),
  getautopublishes: reply("getautopublishes", {
    color: OK,
    title: "Auto Publish - announcements",
    fields: [
      { name: "Blacklisted Users", value: "<@member>" },
      { name: "Blacklisted Words", value: "spoilers" },
    ],
    footer: "Page 1/1",
  }),
  addpublishblacklist: reply(`addpublishblacklist ${MEMBER} #announcements`, rc(`Messages from ${MEMBER} in <#announcements> will no longer be auto published.`)),
  removepublishblacklist: reply(
    `removepublishblacklist ${MEMBER} #announcements`,
    rc(`${MEMBER} has been removed from the auto-publish blacklist in <#announcements>`),
  ),
  invites: reply("invites", {
    color: OK,
    author: "SylveonDeko",
    title: "SylveonDeko has 13 invites.",
    description: "✅ Regular: **12**\n🚪 Left: **3**\n⚠️ Fake: **1**\n🎁 Bonus: **5**",
    footer: "Rank #3 on the invite leaderboard",
  }),
  invitesettings: reply("invitesettings", {
    color: OK,
    title: "Invite Tracking Settings",
    fields: [
      { name: "Tracking", value: "Enabled", inline: true },
      { name: "Remove On Leave", value: "Disabled", inline: true },
      { name: "Min Account Age", value: "7d", inline: true },
      { name: "Count Rejoins", value: "Disabled", inline: true },
      { name: "Flag No Avatar", value: "Enabled", inline: true },
      { name: "Link Channel", value: "<#general>", inline: true },
      { name: "Log Channel", value: "<#invite-log>", inline: true },
    ],
  }),
  toggleinvitetracking: reply("toggleinvitetracking", rc("Invite tracking has been enabled.")),
  toggleremoveinviteonleave: reply("toggleremoveinviteonleave", rc("Removing invites on leave has been enabled.")),
  togglecountrejoins: reply("togglecountrejoins", rc("Rejoining members will earn their inviter a regular invite.")),
  togglefakenoavatar: reply("togglefakenoavatar", rc("Members without an avatar will now be flagged as fake invites.")),
  setminaccountage: reply("setminaccountage 7", rc("Minimum account age for invite tracking set to 7 days.")),
  invitelinkchannel: reply("invitelinkchannel #general", rc("Personal invite links will now point at <#general>.")),
  invitelogchannel: reply("invitelogchannel #invite-log", rc("Join and leave attribution will be logged in <#invite-log>.")),
  inviteleaderboard: reply("inviteleaderboard", {
    color: OK,
    title: "Invite Leaderboard (All Time)",
    description:
      "`1.` **Biscuit**: **31** invites (✅ 28 · 🚪 4 · ⚠️ 1 · 🎁 8)\n`2.` **Mochi**: **22** invites (✅ 20 · 🚪 2 · ⚠️ 0 · 🎁 4)\n`3.` **SylveonDeko**: **13** invites (✅ 12 · 🚪 3 · ⚠️ 1 · 🎁 5)",
    footer: "Page 1/1",
  }),
  invitestats: reply("invitestats", {
    color: OK,
    title: "Growth Analytics (Last 30 Days)",
    fields: [
      { name: "Joins", value: "128", inline: true },
      { name: "Leaves", value: "41", inline: true },
      { name: "Net Growth", value: "+87", inline: true },
      { name: "Retention", value: "68%", inline: true },
      { name: "Fake Joins", value: "6", inline: true },
      { name: "Join Sources", value: "🔗 Invite: 104\n✨ Vanity: 18\n🤖 Bot: 2\n❓ Unknown: 4", inline: true },
      { name: "Top Inviters", value: "1. Biscuit: **31**\n2. Mochi: **22**" },
      { name: "Top Invite Codes", value: "`dekotree` (YouTube): **44**\n`Xk3p9Qd`: **19**" },
    ],
  }),
  whoinvited: reply(`whoinvited ${MEMBER}`, {
    color: OK,
    description: "Biscuit was invited by SylveonDeko.",
    fields: [
      { name: "Invite Code", value: "`dekotree`", inline: true },
      { name: "Joined", value: ago(864000), inline: true },
    ],
  }),
  invitedusers: reply("invitedusers", {
    color: OK,
    title: "Users Invited by SylveonDeko",
    description: `${MEMBER} ${ago(864000)}\n<@mochi> ${ago(432000)} (left)`,
    footer: "Page 1/1",
  }),
  invitedbycode: reply("invitedbycode dekotree", {
    color: OK,
    title: "Members who joined with `dekotree`",
    description: `${MEMBER} ${ago(864000)}`,
    footer: "Page 1/1",
  }),
  invitedbylabel: reply("invitedbylabel YouTube", {
    color: OK,
    title: 'Members who joined through "YouTube"',
    description: `${MEMBER} ${ago(864000)}`,
    footer: "Page 1/1",
  }),
  invitecodes: reply("invitecodes", {
    color: OK,
    title: "SylveonDeko's Invite Codes",
    description: "`dekotree` <#general> uses: **44**/100\n`Xk3p9Qd` <#general> uses: **19** (expires)",
  }),
  invitelink: reply("invitelink", rc("Your invite link is https://fluxer.gg/Xk3p9Qd and has been used **19** times.")),
  addinvites: reply(`addinvites ${MEMBER} 5`, rc(`Added **5** invites to ${MEMBER}. They now have **18**.`)),
  removeinvites: reply(`removeinvites ${MEMBER} 2`, rc(`Removed **2** invites from ${MEMBER}. They now have **16**.`)),
  addbonusinvites: reply(`addbonusinvites ${MEMBER} 5`, rc(`Granted **5** bonus invites to ${MEMBER}. They now have **21**.`)),
  removebonusinvites: reply(`removebonusinvites ${MEMBER} 2`, rc(`Took **2** bonus invites from ${MEMBER}. They now have **19**.`)),
  addfakeinvites: reply(`addfakeinvites ${MEMBER} 3`, rc(`Flagged **3** of ${MEMBER}'s invites as fake. They now have **15**.`)),
  removefakeinvites: reply(`removefakeinvites ${MEMBER} 3`, rc(`Cleared **3** fake invites from ${MEMBER}. They now have **18**.`)),
  resetinvites: reply(`resetinvites ${MEMBER}`, rc(`Invites for ${MEMBER} have been reset.`)),
  syncinvites: reply("syncinvites", rc("Imported invite uses from Discord and raised totals for **3** inviters.")),
  deleteinvite: reply("deleteinvite Xk3p9Qd", rc("Invite Xk3p9Qd has been deleted.")),
  purgeinvites: reply("purgeinvites 1", rc("Deleted **12** invite codes.")),
  inviteblacklist: reply(`inviteblacklist ${MEMBER}`, rc(`${MEMBER} will no longer earn invite credit.`)),
  invitehide: reply(`invitehide ${MEMBER}`, rc(`${MEMBER} is now hidden from invite leaderboards.`)),
  inviteexclusions: reply("inviteexclusions", {
    color: OK,
    title: "Invite Tracking Exclusions",
    fields: [
      { name: "Blacklisted Users", value: "<@member>" },
      { name: "Blacklisted Roles", value: "-" },
      { name: "Hidden From Leaderboard", value: "<@sylveon>" },
    ],
  }),
  invitelabelset: reply("invitelabelset dekotree YouTube", rc("Invite `dekotree` is now labelled **YouTube**.")),
  invitelabelrole: reply("invitelabelrole dekotree @Fan", rc("Members who join with `dekotree` will receive @Fan.")),
  invitelabelremove: reply("invitelabelremove dekotree", rc("Removed the label from `dekotree`.")),
  invitelabels: reply("invitelabels", {
    color: OK,
    title: "Labelled Invite Codes",
    description: "`dekotree`: **YouTube** role @Fan owner <@sylveon>\n`Xk3p9Qd`: **Twitter**",
  }),
  invitemassban: reply(`invitemassban ${MEMBER} raid`, rc("Banned **4** members. **0** failed.")),
  invitemassbancode: reply("invitemassbancode Xk3p9Qd raid", rc("Banned **4** members. **0** failed.")),
  activitygraph: reply("activitygraph", {
    text: "Busiest Days of the Week for The Deko Tree",
    attachments: [{ src: "/img/commands/activitygraph.png", width: 800, height: 600 }],
  }),
  plot: reply("plot sin(x)", {
    text: "Graph of the function sin(x)",
    attachments: [{ src: "/img/commands/plot.png", width: 600, height: 400 }],
  }),
  joinstats: reply("joinstats", {
    color: "#00ccff",
    title: "Joins Over the Last 10 Days",
    image: { src: "/img/commands/joinstats.png", width: 1000, height: 500 },
    fields: [
      { name: "Total Joins", value: "52", inline: true },
      { name: "Average per Day", value: "5.20", inline: true },
      { name: "Peak Day", value: "30 Oct (9 joins)", inline: true },
    ],
  }),
  leavestats: reply("leavestats", {
    color: "#00ccff",
    title: "Leaves Over the Last 10 Days",
    image: { src: "/img/commands/leavestats.png", width: 1000, height: 500 },
    fields: [
      { name: "Total Leaves", value: "19", inline: true },
      { name: "Average per Day", value: "1.90", inline: true },
      { name: "Peak Day", value: "31 Oct (4 leaves)", inline: true },
    ],
  }),
  joinstatscolor: reply("joinstatscolor 255 215 0", confirm("Color Set")),
  leavestatscolor: reply("leavestatscolor 255 215 0", confirm("Color Set")),
  usermessages: reply("usermessages", {
    color: OK,
    title: "Message Count for SylveonDeko",
    description: "Total Message Count: 4210\nMost Active Channel: <#general> (2310 messages)\nLeast Active Channel: <#announcements> (12 messages)",
  }),
  channelmessages: reply("channelmessages", {
    color: OK,
    title: "Message Count for Channel general",
    description: "Total Message Count: 18452\nMost Active User: <@sylveon> (2310 messages)\nLeast Active User: <@member> (4 messages)",
  }),
  servermessages: reply("servermessages", {
    color: OK,
    title: "Message Statistics for The Deko Tree",
    description:
      "Total Message Count: 52310\nMost Active User: <@sylveon> (4210 messages)\nLeast Active User: <@member> (4 messages)\nMost Active Channel: <#general> (18452 messages)\nLeast Active Channel: <#announcements> (12 messages)",
  }),
  topusers: reply("topusers", {
    color: OK,
    title: "Top 10 Users in The Deko Tree",
    description: "#1 - <@sylveon>: 4210 messages (8.05%)\n#2 - <@member>: 3120 messages (5.96%)",
  }),
  togglemsgcount: reply("togglemsgcount", rc("Message counting has been enabled.")),
  minmsglength: reply("minmsglength 5", rc("Minimum counted message length set to 5")),
  resetmessagecounts: reply("resetmessagecounts", confirm("Successfully reset all message counts in this server.")),
  repeat: reply("repeat 1h Remember to read the rules", { color: OK, title: "Repeater Created", description: REPEATER }),
  repeatlist: reply("repeatlist", { color: OK, title: "List of repeaters", fields: [{ name: "#`1`", value: REPEATER }], footer: "Page 1/1" }),
  repeatremove: reply("repeatremove 1", { color: OK, title: "Repeater #1 Removed", description: REPEATER }),
  repeatinvoke: chat(
    "general",
    { ...sylveon("repeatinvoke 1"), reactions: [{ emoji: "🔄", count: 1 }] },
    bot("Remember to read the rules"),
  ),
  repeatredun: reply("repeatredun 1", rc("Repeater **#1** won't post redundant messages anymore.")),
  repeatmessage: reply("repeatmessage 1 Please read the rules", rc("Repeater message updated to:\nPlease read the rules")),
  repeatchannel: reply("repeatchannel 1 #general", rc("Repeater channel updated to <#general>")),
  repeattriggermode: reply("repeattriggermode 1 Immediate", rc("Sticky #1 trigger mode set to Immediate.")),
  repeatactivity: reply("repeatactivity 1 5 10m", rc("Sticky #1 activity threshold set to 5 messages per 10m 00s.")),
  repeatpriority: reply("repeatpriority 1 80", rc("Sticky #1 priority set to 80.")),
  repeatschedule: chat(
    "general",
    sylveon("repeatschedule 1 business"),
    bot(rc("Sticky #1 scheduled for business hours (timezone: UTC).")),
    bot("💡 Time-based scheduling uses your server timezone. Set it with .timezone if needed."),
  ),
  repeatconversation: reply("repeatconversation 1", rc("Conversation detection enabled for sticky #1. Will not interrupt active discussions.")),
  repeattoggle: reply("repeattoggle 1", rc("Sticky #1 has been disabled.")),
  repeatthreadautosticky: reply("repeatthreadautosticky 1", rc("Thread auto-sticky enabled for sticky #1. Will create in new threads/forum posts.")),
  repeatthreadonly: reply("repeatthreadonly 1", rc("Thread-only mode enabled for sticky #1. Will only post in threads, not parent channel.")),
  repeatsuppressnotifications: reply(
    "repeatsuppressnotifications 1",
    rc("Notification suppression **enabled** for repeater #1. Messages will not send push notifications."),
  ),
  repeatforumtags: reply("repeatforumtags 1 add required 1520000000000000050", rc("Added 1 required tag(s) for sticky #1")),
};
