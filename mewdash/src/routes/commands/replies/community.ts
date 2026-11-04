import { ago, type ChatEmbed, type ChatTextMessage } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, MEMBER, OK, USERNAME, bot, chat, confirm, error, reply, sylveon, users, type CommandPreview } from "./chat";

const OK_EMOTE = "✅";

/** `ReplyConfirmAsync`: the confirm embed with the caller's bold name in front. */
const byUser = (text: string) => confirm(`**${USERNAME}** ${text}`);

/** `ctx.OkAsync`: a check reaction on the command message. */
const reacted = (message: ChatTextMessage): ChatTextMessage => ({ ...message, reactions: [{ emoji: "✅", count: 1, me: true }] });

const INSTANCE_DESCRIPTION =
  "Instance Status Online\nInstance Version: 8\nCommands Count: 1480\nModules Count: 48\nUser Count 3034";

/** An instance status embed with the bot's avatar as thumbnail. */
const instanceCard = (title: string): ChatEmbed => ({
  color: OK,
  title,
  description: INSTANCE_DESCRIPTION,
  thumbnail: { src: users.bot.avatar, width: 128, height: 128 },
});

export const communityPreviews: Record<string, CommandPreview> = {
  addstatusrole: reply("addstatusrole fluxer.gg/deko", confirm("Added statusrole config! Please configure it with the other commands.")),
  removestatusrole: reply("removestatusrole 1", confirm("Statusrole config removed!")),
  setstatusroleembed: reply("setstatusroleembed 1 Thanks for repping the community!", confirm(`${OK_EMOTE} Succesfully set embed text!`)),
  setstatusrolechannel: reply("setstatusrolechannel 1 #general", confirm(`${OK_EMOTE} Succesfully set StatusEmbedChannel to <#general>!`)),
  setaddroles: reply("setaddroles 1 @Supporter", confirm(`${OK_EMOTE} Having this status will now add the following roles:\n@Supporter`)),
  setremoveroles: reply("setremoveroles 1 @Newcomer", confirm(`${OK_EMOTE} Having this status will now remove the following roles:\n@Newcomer`)),
  removeaddroles: reply("removeaddroles 1 @Supporter", confirm(`${OK_EMOTE} Succesfully removed the following roles from AddRoles\n@Supporter`)),
  removeremoveroles: reply("removeremoveroles 1 @Newcomer", confirm(`${OK_EMOTE} Succesfully removed the following roles from RemoveRoles\n@Newcomer`)),
  toggleremoveadded: reply("toggleremoveadded 1", confirm(`${OK_EMOTE} RemoveAdded is now \`True\``)),
  togglereaddremoved: reply("togglereaddremoved 1", confirm(`${OK_EMOTE} ReaddRemoved is now \`True\``)),
  liststatusroles: reply(
    "liststatusroles",
    {
      color: OK,
      description:
        "#1\n`Status`: fluxer.gg/deko\n`Channel:` <#general> 1521568983961042950\n`AddRoles`: @Supporter\n`RemoveRoles`: @Newcomer\n`RemoveAdded`: True\n`ReaddRemoved`: True\n`Message:` Thanks for repping the community!",
      footer: "Page 1/1",
    },
  ),

  multigreetadd: reply("multigreetadd #welcome", confirm("Added <#welcome> as a MultiGreet channel!")),
  multigreetremove: reply("multigreetremove 2", confirm("MultiGreet has been removed")),
  multigreetdelete: reply("multigreetdelete 1 30", confirm("Successfully updated MultiGreet #1 to delete after 30 seconds")),
  multigreetdisable: reply("multigreetdisable 1 false", confirm("MultiGreet 1 set to disabled")),
  multigreettype: reply("multigreettype RandomGreet", confirm("Random greet mode enabled")),
  multigreetgreetbots: reply("multigreetgreetbots 1 true", confirm("MultiGreet #1 will greet bots.")),
  multigreetwebhook: reply("multigreetwebhook 1 Greeter", confirm("Webhook has been set successfully")),
  multigreetmessage: reply("multigreetmessage 1 Welcome %user.mention% to %server.name%!", confirm("MultiGreet Message for MultiGreet #1 set!")),
  multigreetlist: reply("multigreetlist", {
    color: OK,
    description:
      "#1\n`Channel:` <#welcome> 1521568983961042951\n`Delete After:` 30s\n`Webhook:` True\n`Greet Bots:` False\n`Disabled`: False\n`Message:` Welcome %user.mention% to %server.name%!",
    footer: "Page 1/2",
  }),

  coprmonitoradd: reply(
    "coprmonitoradd linux4switch/l4s #builds",
    confirm("Now monitoring **linux4switch/l4s** COPR project. Build notifications will be posted in <#builds>."),
  ),
  coprmonitorremove: reply("coprmonitorremove linux4switch/l4s", confirm("Stopped monitoring **linux4switch/l4s** COPR project.")),
  coprmonitorlist: reply("coprmonitorlist", {
    color: OK,
    title: "COPR Monitors",
    description:
      "**linux4switch/l4s**\n├ Channel: <#builds>\n├ Filter: all packages\n├ Notifications: ✅ ❌ ⚠️\n└ Enabled: ✅\n",
    footer: "Page 1/1",
  }),
  coprmonitortoggle: reply("coprmonitortoggle linux4switch/l4s", confirm("Monitor for **linux4switch/l4s** is now disabled.")),
  coprnotify: reply("coprnotify linux4switch/l4s Running true", confirm("Notifications for **linux4switch/l4s** Running builds are now **enabled**.")),
  coprfilter: reply("coprfilter linux4switch/l4s kernel mesa", confirm("Package filter for **linux4switch/l4s** set to: kernel mesa")),
  coprsucceededmessage: reply(
    "coprsucceededmessage linux4switch/l4s %copr.emote% %copr.package% built",
    confirm("Build success message updated!"),
  ),
  coprfailedmessage: reply("coprfailedmessage linux4switch/l4s -", confirm("Failed build messages will use the default format.")),
  coprcanceledmessage: reply(
    "coprcanceledmessage linux4switch/l4s %copr.package% was canceled",
    confirm("Build cancellation message updated!"),
  ),
  coprpendingmessage: reply("coprpendingmessage linux4switch/l4s -", confirm("Pending build messages will use the default format.")),
  coprrunningmessage: reply(
    "coprrunningmessage linux4switch/l4s %copr.package% is building",
    confirm("Running build message updated!"),
  ),
  coprskippedmessage: reply("coprskippedmessage linux4switch/l4s -", confirm("Skipped build messages will use the default format.")),
  coprdefaultmessage: reply("coprdefaultmessage linux4switch/l4s %copr.package% is now %copr.status%", confirm("Default build message updated!")),
  coprtemplate: reply("coprtemplate linux4switch/l4s Failed %copr.package% failed, see %copr.url%", confirm("Failed build template updated!")),
  coprtemplateshow: reply("coprtemplateshow linux4switch/l4s Failed", {
    color: OK,
    title: "linux4switch/l4s Failed template",
    description: "```\n%copr.package% failed, see %copr.url%\n```",
  }),

  statroleadd: reply(
    "statroleadd @Active Messages 500 30 Active Chatter",
    byUser("Created stat role **#1** for @Active: 500+ messages (last 30d)"),
  ),
  statroletop: reply(
    "statroletop @Top10 Messages 10 7",
    byUser("Created stat role **#2** for @Top10: top #1-10 by messages (last 7d)"),
  ),
  statrolepercent: reply(
    "statrolepercent @Regular VoiceMinutes 5",
    byUser("Created stat role **#3** for @Regular: top 1-5% by voice minutes (all time)"),
  ),
  statrolestreak: reply(
    "statrolestreak @Daily Messages 20 5 14",
    byUser("Created stat role **#4** for @Daily: 20+ messages on 5+ days (last 14d)"),
  ),
  statrolelist: reply("statrolelist", {
    color: OK,
    title: "Stat Roles",
    fields: [
      { name: "#1 Active Chatter", value: "@Active: 500+ messages (last 30d)" },
      { name: "#2 Top10", value: "@Top10: top #1-10 by messages (last 7d) (permanent)" },
      { name: "#3 Regular", value: "@Regular: top 1-5% by voice minutes (all time) (disabled)" },
    ],
  }),
  statroleinfo: reply("statroleinfo 1", {
    color: OK,
    title: "Stat Role #1: Active Chatter",
    fields: [
      { name: "Role", value: "@Active", inline: true },
      { name: "Status", value: "Enabled", inline: true },
      { name: "Condition", value: "500+ messages (last 30d)" },
      { name: "Interval", value: "60m", inline: true },
      { name: "Last Run", value: ago(1260), inline: true },
      { name: "Options", value: "permanent: False, invert: False, bots: False" },
      { name: "Channel Filter", value: "-", inline: true },
      { name: "Required Roles", value: "-", inline: true },
      { name: "Excluded Roles", value: "-", inline: true },
      { name: "Ignored Members", value: "-", inline: true },
      { name: "Notify", value: "<#general>", inline: true },
      { name: "Notification Message", value: "%user% %action% %role%" },
    ],
  }),
  statroleremove: reply("statroleremove 3", byUser("Removed stat role **#3**.")),
  statroletoggle: reply("statroletoggle 1", byUser("Stat role **#1** is disabled.")),
  statrolepreview: reply("statrolepreview 1", {
    color: OK,
    title: "Preview: Active Chatter",
    description: "500+ messages (last 30d)",
    fields: [
      { name: "Qualifying", value: "42", inline: true },
      { name: "To Grant", value: "3", inline: true },
      { name: "To Remove", value: "1", inline: true },
      { name: "Gaining The Role", value: `${MEMBER} (612), ${AUTHOR} (540)` },
      { name: "Losing The Role", value: "-" },
    ],
  }),
  statrolerun: reply("statrolerun 1", {
    color: OK,
    title: "Run: Active Chatter",
    description: "500+ messages (last 30d)",
    fields: [
      { name: "Qualifying", value: "42", inline: true },
      { name: "To Grant", value: "3", inline: true },
      { name: "To Remove", value: "1", inline: true },
      { name: "Gaining The Role", value: `${MEMBER} (612), ${AUTHOR} (540)` },
      { name: "Losing The Role", value: "-" },
      { name: "Applied", value: "Granted **3**, removed **1**, failed **0**." },
    ],
  }),
  statroleset: reply("statroleset 1 min 750", byUser("Updated stat role **#1**: 750+ messages (last 30d)")),
  statrolefilter: reply("statrolefilter 1 #general", byUser("Added <#general> to the filter on stat role **#1**.")),

  statchannelcreate: reply("statchannelcreate TotalMembers", confirm("Created stat channel **👥 Members: 12,480** with type **Total Members**.")),
  statchanneladd: reply("statchanneladd #stats BotCount", confirm("Stat channel **🤖 Bots: 447** added with type **Bots**.")),
  statchannelrole: reply("statchannelrole #stats @Verified", confirm("Stat channel **Verified: 8,910** added with type **Role: Verified**.")),
  statchannelcountdown: reply("statchannelcountdown #stats 2026-12-25", confirm("Stat channel **⏳ 52d 6h left** added with type **Countdown**.")),
  statchannelgoal: reply("statchannelgoal #stats 15000", confirm("Stat channel **🎯 12,480 / 15,000** added with type **Goal: 15000**.")),
  statchanneltwitchcounter: reply("statchanneltwitchcounter #stats deaths", confirm("Stat channel **Deaths: 128** added with type **Twitch Counter: deaths**.")),
  statchannelmechanism: reply("statchannelmechanism #stats Auto 10", confirm("**👥 Members: 12,480** now updates by **Auto** every **10** minutes.")),
  statchannelstyle: reply("statchannelstyle #stats Compact", confirm("**👥 Members: 12,480** now uses the **Compact** style, for example `1.2K`.")),
  statchanneldefaults: reply(
    "statchanneldefaults Rename 10 Comma",
    confirm("New stat channels will default to **Rename** every **10** minutes with the **Comma** style."),
  ),
  statchanneltypes: reply("statchanneltypes Members", {
    color: OK,
    title: "Available Stat Types",
    fields: [
      {
        name: "Members",
        value:
          "`TotalMembers` **Total Members**: 👥 Members: 12,480\n`HumanMembers` **Human Members**: 🧍 Humans: 12,033\n`BotCount` **Bots**: 🤖 Bots: 447\n`OnlineMembers` **Online Members**: 🟢 Online: 1,204",
      },
    ],
  }),
  statchannelremove: reply("statchannelremove #stats", confirm("Stat channel **👥 Members: 12,480** removed.")),
  statchannellist: reply("statchannellist", {
    color: OK,
    title: "Stat Channels",
    fields: [
      {
        name: "👥 Members: 12,480",
        value: "Type: Total Members | Style: Comma | Mode: Rename every 10m\nTemplate: `👥 Members: %count%`",
      },
      {
        name: "🎯 12,480 / 15,000",
        value: "Type: Member Goal | Style: Comma | Mode: Auto every 10m\nTemplate: `🎯 %count% / %goal%`",
      },
    ],
  }),

  serveractivity: reply("serveractivity", {
    color: OK,
    author: "The Deko Tree",
    title: "Community Activity (Last 7 Days)",
    fields: [
      { name: "Messages", value: "18,342", inline: true },
      { name: "Voice Time", value: "6d 14h", inline: true },
      { name: "Contributors", value: "💬 214 · 🔊 58", inline: true },
      { name: "Joins / Leaves", value: "📥 96 · 📤 31 · net +65", inline: true },
      { name: "Members", value: "1,204 total · 312 online", inline: true },
      {
        name: "Leaders",
        value:
          "💬 Top chatter: <@sylveon> (2,481)\n🔊 Top voice: <@member> (31h 20m)\n📝 Busiest channel: <#general> (7,905)\n🎙️ Busiest voice: <#lounge> (48h 5m)\n🎮 Most played: **Minecraft** (41h 12m, 17 players)",
      },
    ],
  }),
  useractivity: reply("useractivity", {
    color: OK,
    author: "SylveonDeko",
    title: "Activity (Last 7 Days)",
    fields: [
      { name: "Messages", value: "2,481 (#1)", inline: true },
      { name: "Voice Time", value: "12h 40m (#4)", inline: true },
      { name: "Lifetime", value: "💬 61,208 · 🔊 214h 3m", inline: true },
      { name: "Top Channels", value: "<#general>: **1,204**\n<#dev>: **733**", inline: true },
      { name: "Top Voice Channels", value: "<#lounge>: **9h 12m**", inline: true },
      { name: "Top Games", value: "🎮 Minecraft: **8h 4m**\n🎵 Spotify: **5h 30m**", inline: true },
      { name: "Joined", value: ago(15552000), inline: true },
      { name: "Account Created", value: ago(63072000), inline: true },
    ],
  }),
  topgames: reply("topgames", {
    color: OK,
    title: "Top Games & Apps (Last 7 Days)",
    description:
      "`1.` 🎮 **Minecraft**: 41h 12m · 17 players (38%)\n`2.` 🎵 **Spotify**: 29h 40m · 22 players (27%)\n`3.` 🎮 **Stardew Valley**: 18h 3m · 6 players (17%)\n`4.` 📺 **Just Chatting**: 11h 45m · 3 players (11%)\n`5.` 🎮 **Celeste**: 8h 20m · 4 players (8%)",
  }),
  whoplays: reply("whoplays Minecraft", {
    color: OK,
    title: "Who plays Minecraft?",
    fields: [
      { name: "Right Now", value: "3", inline: true },
      { name: "Players (Last 7 Days)", value: "17", inline: true },
      { name: "Total Time", value: "1d 17h", inline: true },
      { name: "Top Players", value: `\`1.\` ${AUTHOR}: **8h 4m**\n\`2.\` ${MEMBER}: **6h 51m**` },
    ],
  }),
  statstrackactivities: reply(
    "statstrackactivities",
    byUser("Game and app activity tracking is now enabled. Only activities Discord itself attests to are counted unless verification is turned off."),
  ),
  statsverifyactivities: reply(
    "statsverifyactivities",
    byUser("Only activities backed by a Discord application, Spotify or a stream will be counted."),
  ),
  statsactivityfiltermode: reply("statsactivityfiltermode Blacklist", byUser("The activity filter is now a **Blacklist**.")),
  statsactivityfilter: reply("statsactivityfilter Spotify", byUser("Added **Spotify** to the activity filter.")),
  statsactivityfilters: reply("statsactivityfilters", {
    color: OK,
    title: "Activity Filter (Blacklist)",
    description: "Spotify\nYouTube",
  }),
  channelactivity: reply("channelactivity #general", {
    color: OK,
    title: "#general Activity (Last 7 Days)",
    fields: [
      { name: "Messages", value: "7,905", inline: true },
      { name: "Voice Time", value: "0m", inline: true },
      { name: "Contributors", value: "143", inline: true },
      { name: "Top Chatters", value: `${AUTHOR}: **1,204**\n${MEMBER}: **981**`, inline: true },
    ],
  }),
  activitytop: reply("activitytop Messages", {
    color: OK,
    title: "Top Members by Messages (Last 7 Days)",
    description: `\`1.\` ${AUTHOR}: **2,481**\n\`2.\` ${MEMBER}: **1,960**\n\`3.\` <@sylveon>: **1,102**`,
    footer: "Page 1/5",
  }),
  activitytopchannels: reply("activitytopchannels Messages", {
    color: OK,
    title: "Top Channels by Messages (Last 7 Days)",
    description: "`1.` <#general>: **7,905**\n`2.` <#dev>: **3,412**\n`3.` <#memes>: **2,210**",
    footer: "Page 1/2",
  }),
  activitychart: reply("activitychart Messages", {
    color: OK,
    title: "Messages (Last 7 Days)",
    fields: [
      { name: "Total", value: "18,342", inline: true },
      { name: "Average", value: "2,620.3", inline: true },
      { name: "Peak", value: "3,904 (29 Oct)", inline: true },
    ],
  }),
  activityexport: reply("activityexport Messages 30", "Here is your export."),
  statssettings: reply("statssettings", {
    color: OK,
    title: "Activity Stats Settings",
    fields: [
      { name: "Default Window", value: "7d", inline: true },
      { name: "Message Cooldown", value: "5s", inline: true },
      { name: "Voice Tracking", value: "Enabled", inline: true },
      { name: "Snapshots", value: "Enabled", inline: true },
      { name: "Bots", value: "Ignored", inline: true },
      { name: "Ignored Voice States", value: "Afk, Alone", inline: true },
      { name: "Game Tracking", value: "Enabled", inline: true },
      { name: "Verify Activities", value: "Enabled", inline: true },
      { name: "Activity Filter", value: "Blacklist: Spotify, YouTube", inline: true },
    ],
  }),
  statslookback: reply("statslookback 14", byUser("Stats commands now default to the last **14** days.")),
  statscooldown: reply("statscooldown 10", byUser("Messages from the same member now count at most once every **10** seconds.")),
  statstrackvoice: reply("statstrackvoice", byUser("Voice time tracking is now disabled.")),
  statstracksnapshots: reply("statstracksnapshots", byUser("Hourly member and status snapshots are now enabled.")),
  statscountbots: reply("statscountbots", byUser("Bots are now left out of activity stats.")),
  statsignorevoicestate: reply("statsignorevoicestate Afk", byUser("Time spent **Afk** no longer counts toward voice stats.")),
  statsignore: reply("statsignore #bot-spam", byUser("<#bot-spam> is now left out of activity stats.")),
  statsignored: reply("statsignored", {
    color: OK,
    title: "Ignored From Activity Stats",
    fields: [
      { name: "Channels", value: "<#bot-spam>" },
      { name: "Roles", value: "-" },
      { name: "Members", value: "-" },
    ],
  }),
  statsprivacy: reply(
    "statsprivacy",
    byUser("You are now opted out of activity stats everywhere and your recorded stats have been deleted."),
  ),

  liveboardadd: reply(
    "liveboardadd #stats MessageLeaderboard Weekly 10 15",
    byUser("Live board **#1** (MessageLeaderboard) is now posted in <#stats> and refreshes every **15** minutes."),
  ),
  liveboardlist: reply("liveboardlist", {
    color: OK,
    title: "Live Boards",
    description:
      "`#1` **MessageLeaderboard** (Last 7 Days) in <#stats>, every 15m\n`#2` **GrowthChart** (Last 30 Days) in <#stats>, every 60m",
  }),
  liveboardremove: reply("liveboardremove 2", byUser("Removed live board **#2**.")),
  liveboardrefresh: reply("liveboardrefresh", byUser("Refreshed **2** live boards.")),
  serverreportchannel: reply("serverreportchannel #reports", byUser("Community reports will be posted in <#reports>.")),
  serverreportfrequency: reply("serverreportfrequency Weekly", byUser("Community reports will be posted **Weekly**.")),
  serverreportshow: reply("serverreportshow", {
    color: OK,
    title: "Community Report Settings",
    description: `**Enabled:** Yes\n**Channel:** <#reports>\n**Frequency:** Weekly\n**Last sent:** ${ago(172800)}`,
  }),
  serverreportnow: reply("serverreportnow", {
    color: OK,
    author: "The Deko Tree",
    title: "Weekly Community Report (Last 7 Days)",
    fields: [
      { name: "Growth", value: "📥 96 joined · 📤 31 left · net +65\n🔁 Retention 68%", inline: true },
      { name: "Activity", value: "💬 18,342 messages · 🔊 6d 14h in voice\n👥 214 active members", inline: true },
      { name: "Members", value: "1,204 (+65 this period)", inline: true },
      { name: "Top Chatters", value: `1. ${AUTHOR}: **2,481**\n2. ${MEMBER}: **1,960**`, inline: true },
      { name: "Busiest Channels", value: "1. <#general>: **7,905**\n2. <#dev>: **3,412**", inline: true },
    ],
  }),

  voicecontrols: reply("voicecontrols", {
    color: OK,
    title: "SylveonDeko's Channel's Custom Voice Controls",
    description: "Manage your custom voice channel below:",
    fields: [
      { name: "Owner", value: AUTHOR, inline: true },
      { name: "Created", value: "0.4 hours ago", inline: true },
      { name: "User Limit", value: "Unlimited", inline: true },
      { name: "Bitrate", value: "64 kbps", inline: true },
      { name: "Locked", value: "No", inline: true },
      { name: "Keep Alive", value: "No", inline: true },
      { name: "Users", value: `${AUTHOR}, ${MEMBER}` },
      {
        name: "Commands",
        value:
          "`.voicerename <name>` rename the channel\n`.voicelimit <number>` set the user limit\n`.voicebitrate <kbps>` set the bitrate\n`.voicelock` and `.voiceunlock` lock or unlock it\n`.voicekeepalive` keep it when empty\n`.voiceallow <user>` and `.voicedeny <user>` choose who can join\n`.voicekick <user>` disconnect someone\n`.voicetransfer <user>` hand over ownership\n`.voiceclaim` claim an abandoned channel\n`.voicedelete` delete the channel",
      },
    ],
  }),
  setupvoicehub: reply(
    "setupvoicehub",
    byUser("Custom voice hub created! Join the '➕ Create Voice Channel' channel to create your own voice channel."),
  ),
  setvoicehub: reply("setvoicehub #create-voice", byUser("Voice hub set to create-voice with no specific category.")),
  voiceconfig: reply("voiceconfig", {
    color: OK,
    title: "Custom Voice Configuration",
    fields: [
      { name: "Hub Channel", value: "<#create-voice>", inline: true },
      { name: "Category", value: "<#voice-channels>", inline: true },
      { name: "Default Name Format", value: "{0}'s Channel", inline: true },
      { name: "Default User Limit", value: "Unlimited", inline: true },
      { name: "Default Bitrate", value: "64 kbps", inline: true },
      { name: "Delete When Empty", value: "Yes", inline: true },
      { name: "Empty Timeout", value: "1 minute(s)", inline: true },
      { name: "Allow Multiple Channels", value: "No", inline: true },
      { name: "Allow Name Customization", value: "Yes", inline: true },
      { name: "Allow User Limit Customization", value: "Yes", inline: true },
      { name: "Allow Bitrate Customization", value: "Yes", inline: true },
      { name: "Allow Locking", value: "Yes", inline: true },
      { name: "Allow User Management", value: "Yes", inline: true },
      { name: "Max User Limit", value: "99", inline: true },
      { name: "Max Bitrate", value: "96 kbps", inline: true },
      { name: "Persist User Preferences", value: "Yes", inline: true },
      { name: "Auto Permission", value: "Yes", inline: true },
      { name: "Admin Role", value: "None", inline: true },
    ],
  }),
  voicechannels: reply("voicechannels", {
    color: OK,
    title: "Custom Voice Channels",
    description: `**SylveonDeko's Channel** (1521568983961042960)\n👤 Owner: ${AUTHOR}\n👥 Users: 2\n🔒 Locked: No\n📅 Created: 0.4 hours ago\n\n**Biscuit's Channel** (1521568983961042961)\n👤 Owner: ${MEMBER}\n👥 Users: 1\n🔒 Locked: Yes\n📅 Created: 2.3 hours ago`,
  }),
  voicerename: reply("voicerename Dev Hangout", byUser("Successfully renamed your channel to **Dev Hangout**.")),
  voicelimit: reply("voicelimit 4", byUser("Successfully set your channel's user limit to **4**.")),
  voicebitrate: reply("voicebitrate 96", byUser("Successfully set your channel's bitrate to **96** kbps.")),
  voicelock: reply("voicelock", byUser("Successfully locked your channel.")),
  voiceunlock: reply("voiceunlock", byUser("Successfully unlocked your channel.")),
  voiceallow: reply(`voiceallow ${MEMBER}`, byUser(`Successfully allowed ${MEMBER} to join your channel.`)),
  voicedeny: reply(`voicedeny ${MEMBER}`, byUser(`Successfully denied ${MEMBER} from your channel.`)),
  voiceclaim: reply("voiceclaim", byUser("You are now the owner of this channel.")),
  voicetransfer: reply(`voicetransfer ${MEMBER}`, byUser(`Successfully transferred ownership to ${MEMBER}.`)),
  voicekick: reply(`voicekick ${MEMBER}`, byUser(`Successfully kicked ${MEMBER} from your channel.`)),
  voicedelete: reply("voicedelete", byUser("Your channel was deleted.")),
  voicekeepalive: reply("voicekeepalive", byUser("Your channel is now set to keep-alive.")),
  voicepreferences: reply("voicepreferences", {
    color: OK,
    title: "Voice Channel Preferences",
    description: "These settings will be applied to any new voice channels you create.",
    fields: [
      { name: "Channel Name Format", value: "Dev Hangout", inline: true },
      { name: "User Limit", value: "4", inline: true },
      { name: "Bitrate", value: "96 kbps", inline: true },
      { name: "Locked", value: "False", inline: true },
      { name: "Keep Alive", value: "Default", inline: true },
      { name: "Allowed Users", value: MEMBER },
      {
        name: "Commands",
        value:
          "`.voiceprefs name <format>` - Set preferred name format\n`.voiceprefs limit <number>` - Set preferred user limit\n`.voiceprefs bitrate <number>` - Set preferred bitrate (kbps)\n`.voiceprefs lock <true/false>` - Set preferred lock status\n`.voiceprefs keepalive <true/false>` - Set preferred keep alive status\n`.voiceprefs reset` - Reset all preferences",
      },
    ],
  }),
  voiceprefsname: reply("voiceprefsname Dev Hangout", byUser("Your preferred name format is now set to: **Dev Hangout**")),
  voiceprefslimit: reply("voiceprefslimit 4", byUser("Your preferred user limit is now set to: **4**")),
  voiceprefsbitrate: reply("voiceprefsbitrate 96", byUser("Your preferred bitrate is now set to: **96** kbps")),
  voiceprefslock: reply("voiceprefslock true", byUser("Your channels will now be created **locked** by default.")),
  voiceprefskeepalive: reply("voiceprefskeepalive true", byUser("Your channels will now be **kept alive** by default.")),
  voiceprefsreset: reply("voiceprefsreset", byUser("All your voice channel preferences have been reset to community defaults.")),

  patreonch: reply("patreonch #announcements", byUser("Patreon announcement channel has been set to <#announcements>.")),
  patreondisable: reply("patreondisable", byUser("Patreon announcements have been disabled.")),
  patreonmsg: reply("patreonmsg Thanks to %supporters.summary%!", byUser("Custom Patreon announcement message has been set.")),
  patreonday: reply("patreonday 15", byUser("Patreon announcement day has been set to 15.")),
  patreontoggle: reply("patreontoggle", byUser("Patreon announcements have been enabled.")),
  patreonconfig: reply("patreonconfig", {
    color: OK,
    title: "Patreon Configuration",
    fields: [
      { name: "Status", value: "Enabled", inline: true },
      { name: "Channel", value: "<#announcements>", inline: true },
      { name: "Announcement Day", value: "15", inline: true },
      { name: "Message Type", value: "Custom", inline: true },
      { name: "Last Announcement", value: ago(1814400), inline: true },
    ],
  }),
  patreonannounce: reply("patreonannounce", byUser("Patreon announcement has been sent!")),
  patreonhelp: reply("patreonhelp", {
    color: OK,
    title: "Patreon Module Help",
    description: "Manage monthly Patreon supporter announcements with customizable messages and scheduling.",
    fields: [
      {
        name: "Available Placeholders",
        value:
          "**Basic Placeholders:**\n`%server.name%` - Community name\n`%channel.name%` - Channel name\n`%month%` - Current month name\n`%year%` - Current year\n`%patreon.link%` - Patreon link\n\n**Supporter Data:**\n`%supporter.count%` - Active supporters\n`%supporter.new%` - New supporters this month\n`%revenue.monthly%` - Monthly revenue\n`%supporters.summary%` - Formatted supporter text\n`%revenue.summary%` - Revenue summary\n`%growth.summary%` - Growth summary",
      },
      {
        name: "Basic Commands",
        value:
          "`patreon channel` - Set announcement channel\n`patreon message` - Set custom message\n`patreon day` - Set announcement day\n`patreon toggle` - Enable/disable announcements\n`patreon config` - Show current settings\n`patreon announce` - Send manual announcement",
      },
      {
        name: "Advanced Commands",
        value:
          "`patreon sync` - Sync supporter data from API\n`patreon supporters` - List active supporters\n`patreon link` - Link Discord user to Patreon\n`patreon rolesync` - Toggle role synchronization\n`patreon tiermap` - Map tier to Discord role\n`patreon syncall` - Sync all supporter roles\n`patreon stats` - Show supporter statistics\n`patreon goals` - Show campaign goals\n`patreon top` - Show top supporters",
      },
      {
        name: "💡 Example Message with Data",
        value:
          "```🎉 It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%```\nThis becomes: *🎉 It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!*",
      },
    ],
  }),
  patreonsync: reply("patreonsync", {
    color: "#f96854",
    title: "Patreon OAuth",
    description:
      "Use the link below to authorize Mewdeko to access your Patreon campaign data.\n\n[🔗 Authorize with Patreon](https://www.patreon.com/oauth2/authorize?client_id=EXAMPLE)",
    fields: [
      {
        name: "⚠️ Important Requirements",
        value:
          "• You must be the **owner** of a Patreon campaign\n• This will give the bot access to your supporter data\n• You can revoke access anytime from your Patreon settings",
      },
      {
        name: "📋 Setup Process",
        value:
          '1. Open the "Authorize with Patreon" link above\n2. Sign in to Patreon if prompted\n3. Review and approve the requested permissions\n4. You\'ll be redirected back automatically\n5. Your supporters will be synced automatically',
      },
    ],
    footer: "This setup is required only once per community",
  }),
  patreonsupporters: reply("patreonsupporters", {
    color: "#f96854",
    title: "Active Patreon Supporters (3)",
    description: `1. **Biscuit Fan** - $10.00/month\n   Discord: ${MEMBER}\n\n2. **Dana Whitfield** - $5.00/month\n   Discord: Not linked\n\n3. **Leo Marsh** - $3.00/month\n   Discord: ${AUTHOR}\n`,
  }),
  patreonlink: reply(
    `patreonlink ${MEMBER} 48210377`,
    byUser(`Successfully linked ${MEMBER} to Patreon user 48210377`),
  ),
  patreonrolesync: reply("patreonrolesync", byUser("Patreon role synchronization enabled!")),
  patreontiermap: reply("patreontiermap 9482211 @Supporter", byUser("Successfully mapped tier 9482211 to role @Supporter")),
  patreonsyncall: chat("general", sylveon("patreonsyncall"), bot("Synced roles for 12 users!")),
  patreonstats: reply("patreonstats", {
    color: "#f96854",
    title: "Patreon Statistics",
    fields: [
      { name: "Total Supporters", value: "25", inline: true },
      { name: "Linked to Discord", value: "18", inline: true },
      { name: "Total Monthly Revenue", value: "$150.00", inline: true },
      { name: "Average Support", value: "$6.00", inline: true },
      { name: "Configured Tiers", value: "3", inline: true },
      { name: "Campaign Creator", value: "[The Deko Tree](https://www.patreon.com/example)", inline: true },
      { name: "Top Supporter", value: "Biscuit Fan - $10.00/month" },
    ],
  }),
  patreontop: reply("patreontop 3", {
    color: "#f96854",
    title: "Top 3 Patreon Supporters",
    description: "🥇 **Biscuit Fan** - $10.00/month\n🥈 **Dana Whitfield** - $5.00/month\n🥉 **Leo Marsh** - $3.00/month\n",
  }),
  patreonroles: reply("patreonroles", {
    color: "#f96854",
    title: "Patreon Tier Role Mappings",
    description:
      "**Gold** ($10.00/month)\nRole: @Gold Supporter\nTier ID: `9482210`\n\n**Silver** ($5.00/month)\nRole: @Supporter\nTier ID: `9482211`\n\n**Bronze** ($3.00/month)\nRole: Not mapped\nTier ID: `9482212`\n",
  }),
  patreonanalytics: reply("patreonanalytics", {
    color: "#f96854",
    title: "📊 Detailed Patreon Analytics",
    fields: [
      { name: "Supporter Overview", value: "Total: **27**\nActive: **25**\nFormer: **2**\nDiscord Linked: **18**", inline: true },
      { name: "Revenue Analysis", value: "Monthly: **$150.00**\nAverage: **$6.00**\nLifetime: **$1,240.00**\nNew This Month: **3**", inline: true },
      { name: "Tier Distribution", value: "Gold: **4**\nSilver: **9**\nBronze: **12**", inline: true },
      { name: "Top Supporters", value: "1. Biscuit Fan - $10.00 ✅\n2. Dana Whitfield - $5.00 ❌\n3. Leo Marsh - $3.00 ✅" },
    ],
  }),
  patreonrecognize: reply("patreonrecognize #announcements", byUser("Sent 3 supporter recognition messages to <#announcements>!")),

  addinstance: reply("addinstance 5001", instanceCard("Instance Added Mewdeko Canary")),
  listinstances: reply("listinstances", {
    color: OK,
    title: "Registered Bot Instances",
    fields: [
      { name: "🟢 Port 5000", value: INSTANCE_DESCRIPTION },
      { name: "🔴 Port 5001", value: "Instance is offline" },
    ],
  }),
  removeinstance: reply("removeinstance 5001", byUser("Successfully removed instance on port 5001")),
  instancestatus: reply("instancestatus 5000", instanceCard("Instance Status - Port 5000")),
  updateallinstances: reply("updateallinstances", "Triggering update on all instances...", {
    color: OK,
    title: "Instance Update Results",
    fields: [
      { name: "✅ Port 5000", value: "Update triggered." },
      { name: "❌ Port 5001", value: "Instance is offline" },
    ],
  }),
  updateinstance: reply(
    "updateinstance 5000",
    "Triggering update on instance port 5000...",
    confirm(`${OK_EMOTE} Update triggered successfully on port 5000. Update triggered.`),
  ),
  restartallinstances: reply("restartallinstances", "Triggering restart on all instances...", {
    color: OK,
    title: "Instance Restart Results",
    fields: [
      { name: "✅ Port 5000", value: "Restart triggered." },
      { name: "✅ Port 5002", value: "Restart triggered." },
    ],
  }),
  restartinstance: reply(
    "restartinstance 5000",
    "Triggering restart on instance port 5000...",
    confirm(`${OK_EMOTE} Restart triggered successfully on port 5000. Restart triggered.`),
  ),

  update: reply("update", {
    color: "#2ecc71",
    description: "Update completed successfully",
    fields: [
      { name: "Branch", value: "main", inline: true },
      { name: "Status", value: "FastForward", inline: true },
    ],
  }),
  shardstats: reply("shardstats", {
    color: OK,
    author: "Shard Statistics",
    description: "✅ | #0/1 | 412 | 128433",
    footer: "41ms",
  }),
  generatedocs: reply("generatedocs", "⏱ Generating command documentation...", "Command documentation successfully generated!"),
  redisexec: reply("redisexec PING", { color: OK, title: "Redis Response", description: "PONG" }),
  sqlexec: reply("sqlexec DELETE FROM guild_stale WHERE id < 100", error("Affected 3 rows")),
  topserversupdate: reply("topserversupdate", confirm(`${OK_EMOTE} Updated top communities.`)),
  listservers: reply("listservers", {
    color: OK,
    title: "Communities List",
    fields: [
      {
        name: "The Deko Tree | 1521568983961042950",
        value: `Members: 1204\nOnline Members: 312\nOwner: SylveonDeko | 1521568983961042944\nCreated On: ${ago(63072000)}`,
      },
      {
        name: "Biscuit's Bakery | 1521568983961042970",
        value: `Members: 87\nOnline Members: 24\nOwner: Biscuit | 1521568983961042945\nCreated On: ${ago(31536000)}`,
      },
    ],
    footer: "Page 1/1",
  }),
  commandstats: reply("commandstats", {
    color: OK,
    title: "Command Statistics",
    fields: [
      { name: "Command Statistics", value: "ping was used 4211 times" },
      { name: "Module Statistics", value: "Utility was used 18342 times" },
      { name: "User Statistics", value: "SylveonDeko has used commands 6120 times" },
      { name: "Community Statistics", value: "The Deko Tree has used commands 21408 times" },
    ],
  }),
  config: reply("config bot", {
    color: OK,
    title: "⚙️ bot",
    description: "prefix                    = .\nforwardmessages           = True\nforwardtoallowners        = False\nrotatestatuses            = True\nupdatebranch              = main\n",
  }),
  rotateplaying: reply("rotateplaying", byUser("Rotating playing status enabled.")),
  addplaying: reply("addplaying Playing with the Dekos", byUser("Added.")),
  listplaying: reply("listplaying", byUser("Here is a list of rotating statuses:\n`1.` *Playing* with the Dekos\n`2.` *Watching* over The Deko Tree")),
  defprefix: reply("defprefix !", byUser("Changed Default bot prefix from `.` to `!`")),
  removeplaying: reply("removeplaying 2", byUser("Removed the playing message: over The Deko Tree")),
  langsetdefault: reply("langsetdefault en-US", byUser("Bot's default locale is now **en-US** - **English (United States)**")),
  scadd: reply("scadd .ping", {
    color: OK,
    title: "New startup command added.",
    fields: [
      { name: "Community", value: "The Deko Tree/1521568983961042950", inline: true },
      { name: "Channel", value: "general/1521568983961042951", inline: true },
      { name: "Command Text", value: ".ping" },
    ],
  }),
  acadd: reply("acadd 30 .ping", byUser("The command `.ping` will execute every 30s in this channel.")),
  sclist: reply("sclist", {
    color: OK,
    description:
      "```css\n#1\n[Community]: The Deko Tree #1521568983961042950\n[Channel]: general #1521568983961042951\n[Command Text]: .ping```",
    footer: "page 1",
  }),
  aclist: reply("aclist", {
    color: OK,
    description:
      "```css\n#1\n[Community]: The Deko Tree #1521568983961042950\n[Channel]: general #1521568983961042951\n[Interval]: 30\n[Command Text]: .ping```",
    footer: "page 1",
  }),
  wait: reply("wait 1500", confirm("⏲ 1500ms")),
  acrm: chat("general", reacted(sylveon("acrm 1"))),
  scrm: reply("scrm 1", byUser("Startup command successfully removed.")),
  scclear: reply("scclear", byUser("Cleared all startup commands.")),
  forwardmessages: reply("forwardmessages", byUser("I will forward DMs from now on.")),
  forwardtoall: reply("forwardtoall", byUser("I will forward DMs to all owners.")),
  retentionpending: reply("retentionpending", {
    color: OK,
    title: "Pending Data Purges (2)",
    fields: [
      { name: "Old Tavern `1521568983961042980`", value: `Left ${ago(432000)} · purge ${ago(-1166400)} · scan` },
      { name: "Unknown `1521568983961042981`", value: `Left ${ago(86400)} · purge ${ago(-1512000)} · leave` },
    ],
    footer: "Page 1/1",
  }),
  retentionrecent: reply("retentionrecent", {
    color: OK,
    title: "Recent Data Purges",
    fields: [
      {
        name: `Purged ${ago(604800)} · 2 communities · 18204 rows`,
        value: "Quiet Corner `1521568983961042982`, Bot Pit `1521568983961042983`",
      },
    ],
  }),
  retentioncancel: reply("retentioncancel 1521568983961042980", confirm("Cancelled the pending data purge for `1521568983961042980`.")),
  retentionpurge: reply("retentionpurge 1521568983961042980", confirm("Purged 9102 rows for `1521568983961042980`.")),
  retentionpurgeall: reply(
    "retentionpurgeall",
    confirm("Purging 2 communities, this may take a while..."),
    confirm("Purged 2 communities, 11480 rows removed."),
  ),
  retentionscan: reply("retentionscan", confirm("Orphan scan queued 1 community the bot is no longer in.")),
  bothells: reply("bothells", {
    color: OK,
    title: "Bot Hells (1)",
    description: "Communities with at least 50 members and either 30+ bots or 60%+ bots. 0 means that check is off.",
    fields: [
      { name: "Bot Pit `1521568983961042983`", value: "Humans: 18 · Bots: 112 (86%) · Members: 130 · Trigger: count and ratio" },
    ],
    footer: "Page 1/1",
  }),
  bothellcheck: reply("bothellcheck", {
    color: OK,
    title: "The Deko Tree `1521568983961042950`",
    description: "This community is not a bot hell.",
    fields: [
      { name: "Members", value: "1204", inline: true },
      { name: "Humans", value: "1180", inline: true },
      { name: "Bots", value: "24 (2%)", inline: true },
    ],
  }),
  die: reply("die", byUser("Shutting down")),
  setname: reply("setname Mewdeko", byUser("Bot's name changed to **Mewdeko**")),
  setstatus: reply("setstatus Online", byUser("Bot status changed to **Online**")),
  setavatar: reply("setavatar https://cdn.mewdeko.tech/avatars/mewdeko.png", byUser("New avatar set!")),
  setgame: reply("setgame Playing with the Dekos", byUser("New game set!")),
  setstream: reply("setstream https://twitch.tv/sylveondeko Dekos live", byUser("New stream set!")),
  send: reply(`send 1521568983961042945 Thanks for testing!`, confirm(`Message sent to ${MEMBER}!`)),
  imagesreload: reply("imagesreload", byUser("Images will be reloaded within a few seconds.")),
  stringsreload: reply("stringsreload", byUser("Bot strings have been reloaded.")),
  bash: reply("bash echo hello", {
    color: OK,
    author: "Bash Output",
    description: "```bash\nhello\n```",
    fields: [{ name: "Input", value: "echo hello" }],
    footer: "Page 1/1",
  }),
  evaluate: reply("evaluate return 6 * 7;", {
    color: "#2ecc71",
    title: "Evaluation Successful",
    fields: [
      { name: "Result", value: "```csharp\n42\n```" },
      { name: "Source", value: "code block", inline: true },
      { name: "Compilation Time", value: "182ms", inline: true },
      { name: "Execution Time", value: "3ms", inline: true },
      { name: "Return Type", value: "System.Int32", inline: true },
    ],
  }),
};
