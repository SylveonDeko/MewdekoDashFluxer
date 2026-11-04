import { ago, type ChatTextMessage } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, ERROR, MEMBER, OK, TIME, bot, chat, confirm, error, reply, sylveon, type CommandPreview } from "./chat";

const said = (text: string): ChatTextMessage => ({ author: "sylveon", time: TIME, text });

/** A command whose only reply is the bot's check mark on the message. */
const tick = (input: string): CommandPreview => chat("general", { ...sylveon(input), reactions: [{ emoji: "✅", count: 1 }] });

const pageOf = (page: number, total: number) => `Page ${page}/${total}`;

const languages: [string, string][] = [
  ["ar", "العربية"],
  ["zh-TW", "繁體中文, 台灣"],
  ["zh-CN", "简体中文, 中华人民共和国"],
  ["nl-NL", "Nederlands, Nederland"],
  ["en-US", "English, United States"],
  ["fr-FR", "Français, France"],
  ["cs-CZ", "Čeština, Česká republika"],
  ["da-DK", "Dansk, Danmark"],
  ["de-DE", "Deutsch, Deutschland"],
  ["he-IL", "עברית, ישראל"],
  ["hu-HU", "Magyar, Magyarország"],
  ["id-ID", "Bahasa Indonesia, Indonesia"],
  ["it-IT", "Italiano, Italia"],
  ["ja-JP", "日本語, 日本"],
  ["ko-KR", "한국어, 대한민국"],
  ["hi-IN", "Hindi"],
  ["nb-NO", "Norsk, Norge"],
  ["pl-PL", "Polski, Polska"],
  ["pt-BR", "Português Brasileiro, Brasil"],
  ["owo", "*pounces"],
  ["ro-RO", "Română, România"],
  ["ru-RU", "Русский, Россия"],
  ["sr-RS", "Српски, Србија"],
  ["es-ES", "Español, España"],
  ["sv-SE", "Svenska, Sverige"],
  ["tr-TR", "Türkçe, Türkiye"],
  ["ts-TS", "Tsundere, You Baka"],
  ["uk-UA", "Українська, Україна"],
];

const zones: [string, string][] = [
  ["-12:00", "Etc/GMT+12"],
  ["-11:00", "Etc/GMT+11"],
  ["-11:00", "Pacific/Midway"],
  ["-11:00", "Pacific/Pago_Pago"],
  ["-10:00", "Etc/GMT+10"],
  ["-10:00", "Pacific/Honolulu"],
  ["-10:00", "Pacific/Tahiti"],
  ["-09:00", "America/Anchorage"],
  ["-09:00", "America/Juneau"],
  ["-09:00", "Pacific/Gambier"],
  ["-08:00", "America/Los_Angeles"],
  ["-08:00", "America/Tijuana"],
  ["-08:00", "America/Vancouver"],
  ["-07:00", "America/Denver"],
  ["-07:00", "America/Phoenix"],
  ["-07:00", "America/Edmonton"],
  ["-06:00", "America/Chicago"],
  ["-06:00", "America/Mexico_City"],
  ["-06:00", "America/Winnipeg"],
  ["-05:00", "America/New_York"],
];

const logTypes = [
  "AvatarUpdated",
  "ChannelCreated",
  "ChannelDestroyed",
  "ChannelUpdated",
  "InviteCreated",
  "InviteDeleted",
  "MessageDeleted",
  "MessagesBulkDeleted",
  "MessageUpdated",
  "NicknameUpdated",
  "Other",
  "ReactionEvents",
  "RoleCreated",
  "RoleDeleted",
  "RoleUpdated",
  "ServerUpdated",
  "ThreadCreated",
  "ThreadDeleted",
  "ThreadUpdated",
  "UserBanned",
  "UserJoined",
  "UserLeft",
  "UserMuted",
  "UsernameUpdated",
  "UserRoleAdded",
  "UserRoleRemoved",
  "UserUnbanned",
  "UserUpdated",
  "VoicePresence",
  "VoicePresenceTts",
];

const loggedIn: Record<string, string> = {
  MessageDeleted: "<#logs>",
  MessageUpdated: "<#logs>",
  UserBanned: "<#mod-log>",
  UserJoined: "<#join-log>",
  UserLeft: "<#join-log>",
};

const section = (name: string, commands: number) => ({ name, value: `${commands} commands`, inline: true });

export const administrationPreviews: Record<string, CommandPreview> = {
  banbyhash: chat(
    "general",
    sylveon("banbyhash 7d2b9a41c0e85f13"),
    bot(confirm("Are you sure you want to ban 3 users by hash 7d2b9a41c0e85f13?")),
    bot(confirm("Banning 3 users by hash 7d2b9a41c0e85f13...")),
    bot(confirm("Banned 3 users by hash 7d2b9a41c0e85f13")),
  ),
  guildstatsoptout: reply("guildstatsoptout", confirm("Command stats collection disabled.")),
  deleteguildstatsdata: chat(
    "general",
    sylveon("deleteguildstatsdata"),
    bot(confirm("Are you sure you want to delete your command stats? This action cannot be undone.")),
    bot(error("Command stats deleted.")),
  ),
  setnick: reply(`setnick ${MEMBER} Cookie`, confirm("Nickname of the user **Biscuit** changed to **Cookie**")),
  baninrole: chat(
    "general",
    sylveon("baninrole <@Raiders> Raid wave"),
    bot(confirm("## Are you sure you want to ban 12 users in the role <@Raiders>? \n # This cannot be stopped!!!")),
    bot(confirm("Successfully banned 12 users with the role <@Raiders>.")),
  ),
  nameban: chat(
    "general",
    sylveon("nameban ^spam"),
    bot(confirm("How many days of messages should it delete? Maximum of 14 days. Put 0 to not delete any messages.")),
    said("7"),
    bot(confirm("Preview or Execute bans?"), [
      { emoji: "👁️", count: 1 },
      { emoji: "✅", count: 1 },
      { emoji: "❌", count: 1 },
    ]),
    bot(confirm("Are you sure you want to ban 5 users? This action cannot be undone.")),
    bot(confirm("Banning 5 users...")),
    bot(confirm("Successfully banned 5 users. Failed to ban 0 users.")),
  ),
  banunder: chat(
    "general",
    sylveon("banunder 1d"),
    bot(error("Are you sure you want to ban 8 users that are under that community join age? Say `yes` to continue.")),
    said("yes"),
    bot(
      confirm(
        "Banned 8 users under that community join age, and was unable to ban 0 users.\nIf there were any failed bans please check the bots top role and try again.",
      ),
    ),
  ),
  kickunder: chat(
    "general",
    sylveon("kickunder 1d"),
    bot(error("Are you sure you want to kick 8 users that are under that community join age? Say `yes` to continue.")),
    said("yes"),
    bot(
      confirm(
        "Kicked 8 users under that community join age, and was unable to kick 0 users.\nIf there were any failed kicks please check the bots top role and try again.",
      ),
    ),
  ),
  memberrole: reply("memberrole <@Member>", confirm("Member role has been set to <@Member>")),
  staffrole: reply("staffrole <@Staff>", confirm("Staff role has been set to <@Staff>")),
  staffroledisable: reply("staffroledisable", confirm("Staff Role disabled!")),
  delmsgoncmd: chat(
    "general",
    sylveon("delmsgoncmd"),
    bot(confirm("I will auto-delete messages which successfully execute commands on this community.")),
    sylveon("delmsgoncmd channel enable <#bot-commands>"),
    bot(confirm("I will always auto-delete messages which successfully execute commands on this channel, regardless of the community setting.")),
    sylveon("delmsgoncmd list"),
    bot({
      color: OK,
      title: "Community Setting",
      description: "✅",
      fields: [{ name: "Channel-Specific Settings", value: "✅ bot-commands\n❌ general" }],
    }),
  ),
  deafen: reply(`deafen ${MEMBER}`, confirm("Deafen successful.")),
  undeafen: reply(`undeafen ${MEMBER}`, confirm("Undeafen successful.")),
  delvoichanl: reply("delvoichanl Gaming", confirm("Voice channel **Gaming** deleted.")),
  creatvoichanl: reply("creatvoichanl Gaming", confirm("Voice channel **Gaming** created.")),
  deltxtchanl: reply("deltxtchanl memes", confirm("Text channel **memes** deleted.")),
  creatxtchanl: reply("creatxtchanl memes", confirm("Text channel **memes** created.")),
  settopic: reply("settopic Share your best screenshots here", confirm("New channel topic set.")),
  setchanlname: reply("setchanlname screenshots", confirm("New channel name set.")),
  nsfwtoggle: reply("nsfwtoggle", confirm("NSFW has been enabled on this channel.")),
  renamechannel: reply("renamechannel <#general> lounge", confirm("Channel Renamed")),
  delete: tick("delete 1388294715602313216"),
  setguildavatar: reply("setguildavatar https://cdn.mewdeko.tech/avatar.png", confirm("Successfully set the bot's community avatar!")),
  setguildbanner: reply("setguildbanner https://cdn.mewdeko.tech/banner.png", confirm("Successfully set the bot's community banner!")),
  setguildbio: reply("setguildbio Your friendly neighbourhood cat bot", confirm("Successfully set the bot's community bio!")),
  autoassignrole: reply(
    "autoassignrole <@Member>",
    confirm("The following roles are applied to users that join this community: \n**<@Member>**"),
  ),
  autoassignbotrole: reply(
    "autoassignbotrole <@Bots>",
    confirm("The following roles are applied to bots that join this community: \n**<@Bots>**"),
  ),
  autobanroleadd: reply("autobanroleadd <@Raiders>", confirm("Added <@Raiders> to the auto ban role list.")),
  autobanroleremove: reply("autobanroleremove <@Raiders>", confirm("Removed <@Raiders> from the auto ban role list.")),
  autobanrolereason: reply(
    "autobanrolereason <@Raiders> Raid participant",
    confirm("Set the ban reason for <@Raiders> to: Raid participant"),
  ),
  autobanrolelist: reply("autobanrolelist", {
    color: ERROR,
    title: "Auto-Ban Roles",
    description: "• <@Raiders> (`1408836920145017856`)\n  └ Reason: Raid participant",
    footer: "Total: 1 role(s)",
  }),
  dpo: reply("dpo purge ManageMessages", confirm("Users will need **ManageMessages** permission in order to run `purge` command.")),
  dpor: chat(
    "general",
    sylveon("dpor"),
    bot(confirm("Are you sure that you want to remove **ALL** discord permission overrides on this community? This action is irreversible.")),
    bot(confirm("All discord permission overrides have been cleared.")),
  ),
  dpol: reply("dpol", { color: OK, description: "purge => ManageMessages\nban => BanMembers", footer: pageOf(1, 1) }),
  languageset: reply("languageset de-DE", confirm("Your community's locale is now **de-DE** - **Deutsch (Deutschland)**")),
  languageslist: reply("languageslist", {
    color: OK,
    title: "List of languages",
    description: languages.map(([code, name]) => `\`${code}\` => ${name}`).join("\n"),
  }),
  logignorelist: reply("logignorelist", confirm("<#bot-commands>\n<#spam>", "Ignored channels for logging:")),
  logignore: reply("logignore <#bot-commands>", confirm("Channel <#bot-commands> is now ignored for logging.")),
  logevents: reply(
    "logevents",
    confirm(`**Log events you can subscribe to:**\n${logTypes.map((type) => `**${type}**${loggedIn[type] ? ` ${loggedIn[type]}` : ""}`).join("\n")}`),
  ),
  logcategory: reply("logcategory messages <#logs>", confirm("Logging for the Messages category has been set to <#logs>.")),
  log: reply("log MessageDeleted <#logs>", confirm("Logging has been enabled for the event **MessageDeleted** in <#logs>")),
  commandlogchannel: reply("commandlogchannel <#command-logs>", confirm("Command logging has been enabled.")),
  prefix: chat(
    "general",
    sylveon("prefix"),
    bot(confirm("Prefix on this community is `.`")),
    sylveon("prefix !"),
    bot(confirm("Changed prefix on this community from `.` to `!`")),
  ),
  unblockimage: reply("unblockimage 3", confirm("Removed blocked image `3`.")),
  patternremove: reply("patternremove 2", confirm("Pattern with ID **2** has been removed successfully.")),
  patternlist: reply("patternlist", {
    color: OK,
    title: "Anti-Pattern Protection - Configured Patterns",
    description: "**Action:** Ban\n**Triggered:** 4 times",
    fields: [
      {
        name: "ID: 1 - NumberedNames",
        value: "**Pattern:** `^[a-z]+\\d{4}$`\n**Username:** ✅\n**Display Name:** ❌",
        inline: true,
      },
      {
        name: "ID: 2 - Unnamed",
        value: "**Pattern:** `(?i)free\\s?nitro`\n**Username:** ✅\n**Display Name:** ✅",
        inline: true,
      },
    ],
  }),
  patternconfig: chat(
    "general",
    sylveon("patternconfig minimumscore 60"),
    bot(confirm("Updated **minimumscore** to `60`.")),
    sylveon("patternconfig"),
    bot({
      color: OK,
      title: "Anti-Pattern Configuration",
      description: "**Action:** Ban\n**Minimum Score:** 60",
      fields: [
        { name: "Account Age Check", value: "**Enabled:** True\n**Max Age:** 6 months", inline: true },
        { name: "Join Timing Check", value: "**Enabled:** True\n**Max Hours:** 24h", inline: true },
        { name: "Batch Creation Check", value: "**Enabled:** True", inline: true },
        { name: "Offline Status Check", value: "**Enabled:** False", inline: true },
        { name: "New Account Check", value: "**Enabled:** True\n**Days:** 7", inline: true },
        { name: "Statistics", value: "**Patterns:** 2\n**Triggered:** 4 times", inline: true },
      ],
    }),
  ),
  patternadd: reply(
    "patternadd ^[a-z]+\\d{4}$ NumberedNames",
    confirm("Pattern **NumberedNames** has been added successfully.\nPattern: `^[a-z]+\\d{4}$`\nChecks Username: True\nChecks Display Name: True"),
  ),
  imagehash: reply("imagehash https://cdn.mewdeko.tech/giveaway.png", confirm("Image hash: `a3f9c2e17b4d8a06`")),
  blockimage: reply(
    "blockimage https://cdn.mewdeko.tech/giveaway.png Fake Giveaway",
    confirm(
      "Blocked image `a3f9c2e17b4d8a06` as **Fake Giveaway**.\nAction: **Ban**\nAnyone re-posting this image will be actioned, including copies that were resized, recompressed, mirrored, or wrapped in a border.",
    ),
  ),
  blockedimages: reply("blockedimages", {
    color: OK,
    title: "Blocked Images",
    description: `\`1.\` **Fake Giveaway**\nHash: \`a3f9c2e17b4d8a06\` | Action: Ban | Hits: **12** | Last: ${ago(7200)}\n\n\`2.\` **Unnamed**\nHash: \`5c01de8a93f2b740\` | Action: Ban | Hits: **0** | Never triggered`,
    footer: pageOf(1, 1),
  }),
  antispam: reply(
    "antispam 5 mute 10m",
    confirm(
      `${AUTHOR} If a user posts **5** same messages in a row, I will **Mute (10 minutes)** them.\n    __IgnoredChannels__: none`,
      "Anti-Spam Enabled",
    ),
  ),
  antiraid: reply(
    "antiraid 5 10 ban",
    confirm(`${AUTHOR} If **5** or more users join within **10** seconds, I will **Ban** them.`, "Anti-Raid Enabled"),
  ),
  antialt: tick("antialt 3d ban"),
  antimassmention: tick("antimassmention 5 10 8 true mute 10m"),
  antimasspost: reply(
    "antimasspost 3 60 ban",
    confirm("Anti-Mass-Post protection has been **enabled**.\n**Channel Threshold:** 3\n**Time Window:** 60s\n**Action:** Ban"),
  ),
  antipostchannel: reply(
    "antipostchannel ban",
    confirm(
      "Anti-Post-Channel protection has been **enabled**.\n**Action:** Ban\n\nUse `.antipostchanneladd <channel>` to add honeypot channels.",
    ),
  ),
  antipostchanneladd: reply(
    "antipostchanneladd <#honeypot>",
    confirm("Added <#honeypot> as a honeypot channel. Anyone posting there will be automatically actioned."),
  ),
  antipostchannelremove: reply("antipostchannelremove <#honeypot>", confirm("Removed <#honeypot> from honeypot channels.")),
  antipattern: reply("antipattern ban", confirm("Anti-Pattern protection enabled with action: **Ban**")),
  antiimagehash: reply(
    "antiimagehash ban",
    confirm(
      "Anti-Image-Hash protection has been **enabled**.\n**Action:** Ban\n**Match tolerance:** 31\n\nUse `.blockimage` while attaching or replying to an image to block it.",
    ),
  ),
  antiimagehashpreset: reply(
    "antiimagehashpreset",
    confirm(
      "Now blocking the **47** known scam images that ship with Mewdeko, on top of your own blocked list. These are the fake crypto casino and giveaway images currently being spammed across Discord.",
    ),
  ),
  antiimagehashignore: reply(
    "antiimagehashignore <@Trusted>",
    confirm("Members of <@Trusted> are now exempt from Anti-Image-Hash protection."),
  ),
  setrole: reply(`setrole Verified ${MEMBER}`, confirm("Successfully added role **Verified** to user **Biscuit**")),
  rolehoist: reply("rolehoist Staff", confirm("Role **Staff** is now displayed separately from online members.")),
  rolecolor: chat(
    "general",
    sylveon("rolecolor Staff"),
    bot(confirm("e91e63", "Role Color")),
    sylveon("rolecolor Staff #3498db"),
    bot(confirm("Color of **Staff** role has been changed.")),
  ),
  renamerole: reply("renamerole Staff Moderators", confirm("Role renamed.")),
  removerole: reply(`removerole Verified ${MEMBER}`, confirm("Successfully removed role **Verified** from user **Biscuit**")),
  removeallroles: reply(`removeallroles ${MEMBER}`, confirm("Successfully removed all roles from user **Biscuit**")),
  reactionrolesremove: reply("reactionrolesremove 1", confirm("Removed ReactionRole message #1")),
  reactionroleslist: reply("reactionroleslist", {
    color: OK,
    fields: [
      { name: "ID", value: "1" },
      { name: "Roles: 2", value: "🔴 <@Red>,🔵 <@Blue>" },
      { name: "Users can select more than one role", value: "False" },
      { name: "Was deleted", value: "No" },
      { name: "Message Link", value: "[Link](https://mewdeko.tech)" },
    ],
    footer: pageOf(1, 1),
  }),
  reactionroles: chat(
    "general",
    {
      author: "member",
      time: TIME,
      text: "Pick a colour role below",
      reactions: [
        { emoji: "🔴", count: 1 },
        { emoji: "🔵", count: 1 },
      ],
    },
    { ...sylveon("reactionroles Red 🔴 Blue 🔵"), reactions: [{ emoji: "✅", count: 1 }] },
  ),
  deleterole: reply("deleterole Verified", confirm("Role **Verified** has been deleted.")),
  createrole: reply("createrole Event Staff", confirm("Successfully created role **Event Staff**")),
  togglexclsar: reply("togglexclsar", confirm("Self assigned roles are now exclusive!")),
  sargn: reply("sargn 1 Colours", confirm("Group #**1** now has a name: **Colours**")),
  rsar: reply("rsar Gamer", confirm("**Gamer** has been removed from the list of self-assignable roles.")),
  rolelevelreq: reply("rolelevelreq 5 Veteran", confirm("Self assignable role **Veteran** now requires at least community level **5**.")),
  lsar: reply("lsar", {
    color: OK,
    title: "**There are 4 self assignable roles**",
    description: "⟪**Group 0**⟫\nGamer\nArtist\n\n⟪**1 - Colours**⟫\nRed\nVeteran (lvl 5+)\n",
    footer: "You can choose any number of roles from any group.",
  }),
  iamnot: reply("iamnot Gamer", confirm("You no longer have **Gamer** role.")),
  iam: reply("iam Gamer", confirm("You now have **Gamer** role.")),
  asar: reply("asar Gamer", confirm("Role **Gamer** has been added to the list in group **0**.")),
  adsarm: reply("adsarm", confirm("Automatic deletion of `.iam` and `.iamn` responses has been enabled.")),
  leavehook: reply("leavehook <#goodbyes> Mewdeko", confirm("Set the leave webhook and enabled webhook leaves")),
  greetdmtest: tick("greetdmtest"),
  greetdmmsg: reply(
    "greetdmmsg Welcome to %server%, %user%!",
    confirm("New DM greet message set."),
    confirm("Enable DM greet messages by typing `.greetdm`"),
  ),
  greetdm: reply("greetdm", confirm("DM greet announcements enabled.")),
  byemsg: reply(
    "byemsg %user% has left %server%",
    confirm("New bye message set."),
    confirm("Enable bye messages by typing `.bye`"),
  ),
  byedel: reply("byedel 30", confirm("Bye messages will be deleted after 30 seconds.")),
  bye: reply("bye", confirm("Bye announcements enabled on this channel.")),
  clearserverrecover: chat(
    "general",
    sylveon("clearserverrecover"),
    bot(confirm("Are you absolutely sure? ***This cannot be undone!***")),
    bot(confirm("Recovery deleted")),
  ),
  timezones: reply("timezones", {
    color: OK,
    title: "Available Timezones",
    description: zones.map(([offset, id], i) => (i % 2 === 1 ? `${offset} \`${id}\`` : `\`${offset}\` ${id}`)).join("\n"),
    footer: pageOf(1, 31),
  }),
  timezone: chat(
    "general",
    sylveon("timezone"),
    bot(confirm("Timezone for this community is `UTC`")),
    sylveon("timezone Europe/London"),
    bot(confirm("(UTC+00:00) United Kingdom Time")),
  ),
  vcrolerm: reply("vcrolerm 1408836920145017856", confirm("Users who join **1408836920145017856** voice channel will no longer get a role.")),
  vcrolelist: reply("vcrolelist", { color: OK, title: "Voice channel roles", description: "**Lounge** => InVoice" }),
  vcrole: reply("vcrole Lounge InVoice", confirm("Users who join **Lounge** voice channel will get **InVoice** role.")),

  afk: reply("afk Gone fishing", confirm("Afk enabled and set to:\n\nGone fishing")),
  timedafk: reply("timedafk 2h Dentist appointment", confirm("AFK set until <t:7200:R> with message: \nDentist appointment")),
  getactiveafks: reply("getactiveafks", {
    color: OK,
    title: "**Active Afks** - 2",
    description: "SylveonDeko\nBiscuit",
    footer: pageOf(1, 1),
  }),
  customafkmessage: reply("customafkmessage Be right back!", confirm("Sucessfully updated afk message!")),
  afkview: reply(`afkview ${MEMBER}`, confirm("**Biscuit** afk is Gone fishing")),
  afkundisable: reply("afkundisable <#spam>", confirm("Successfully removed the channels <#spam> from the list of ignored Afk channels.")),
  afktype: reply("afktype either", confirm("Afk removal type set to `Either`.")),
  afktimeout: reply("afktimeout 30s", confirm("Your AFK Timeout has been set to 30 seconds")),
  afkrm: reply(`afkrm ${MEMBER}`, confirm("Afk removed for 1 users.")),
  afklength: reply("afklength 256", confirm("The Maximum Length is now 256.")),
  afkdisabledlist: reply("afkdisabledlist", { color: OK, title: "Disabled AFK Channels - 1", description: "<#spam>", footer: pageOf(1, 1) }),
  afkdisable: reply("afkdisable <#spam>", confirm("Afk has been disabled in the channels <#spam>")),
  afkdel: chat(
    "general",
    sylveon("afkdel 30"),
    bot(confirm("Afk messages will now delete after 30 seconds.")),
    sylveon("afkdel"),
    bot(confirm("Afk messages will delete after `00:00:30`")),
  ),

  source: reply("source", confirm("https://github.com/sylveondeko/mewdeko")),
  searchcommand: reply("searchcommand banprune", {
    color: OK,
    fields: [
      { name: "Command", value: "banprune\nbanpruneclear\nbanprunereset\nbanpruneset", inline: true },
      {
        name: "Description",
        value:
          "Shows the purge a ban issued in this channel woul…\nRemoves a purge setting so the action falls back …\nRemoves every purge setting in the community.\nSets how many days of messages one ban action pur…",
        inline: true,
      },
    ],
  }),
  modules: reply("modules", {
    color: OK,
    author: "Mewdeko Help Menu",
    description:
      "Do `.cmds modulename` to list a module's commands.\nDo `.h commandname` for help on a single command, or `.searchcmd term` to search every command.\nModules that are crossed out are turned off here.\n\n[Documentation](https://mewdeko.tech) | [Support Community](https://mewdeko.tech/support) | [Invite Me](https://mewdeko.tech) | [Donate!](https://ko-fi.com/mewdeko)",
    fields: [
      {
        name: "Moderation & Admin",
        value:
          "**Administration** · **CountingModeration** · **Moderation** · **Permissions** · **RoleStates** · **ServerManagement** · **StatusRoles**",
      },
      {
        name: "Community Setup",
        value:
          "**ChannelAccess** · **ChatTriggers** · **Confessions** · **CustomVoice** · **Giveaways** · **LiveBoardCommands** · **MultiGreets** · **PollCommands** · **RoleGreets** · **RoleMenus** · **ServerStats** · **Starboard** · **StatChannels** · **StatRoles** · **Suggestions** · **Tickets** · **TwitchCommands**",
      },
      { name: "Fun & Games", value: "**Counting** · **Games** · **Minecraft** · **Nsfw** · **Searches** · **Switch**" },
      { name: "Economy & Levels", value: "**Achievements** · **Currency** · **Patreon** · **Reputation** · **Vote** · **Xp**" },
      { name: "Music", value: "**Music**" },
      {
        name: "Utility",
        value:
          "**Afk** · **Birthday** · **CoprMonitoring** · **Help** · **Highlights** · **Todo** · **UserProfile** · **Utility** · **WordOfTheDay**",
      },
      { name: "Bot Owner", value: "**InstanceManagement** · **OwnerOnly**" },
    ],
  }),
  help: reply("help ping", {
    color: OK,
    fields: [
      { name: "**.ping**", value: "Shows the bot's ping.", inline: true },
      { name: "Usage", value: "`.ping `" },
    ],
    footer: "Module: Utility || Submodule: Utility || Method Name: Ping",
  }),
  guide: reply("guide", confirm("You can find the website at https://mewdeko.tech")),
  donate: reply(
    "donate",
    confirm(
      "If you would like to support the project, here's how:\nKo-Fi: https://ko-fi.com/mewdeko\nI appreciate any donations as they will help improve Mewdeko for the better!",
    ),
  ),
  commands: reply("commands administration", {
    color: OK,
    title: "Administration",
    description:
      "Moderation, punish users, setup self assignable roles and greet messages\n\nDo `.cmds administration sectionname` to list one section, `.cmds administration all` to list everything, or `.cmds administration term` to search it.",
    fields: [
      section("Administration", 27),
      section("AutoAssignRole", 2),
      section("AutoBanRole", 4),
      section("DiscordPermOverride", 3),
      section("Localization", 3),
      section("Log", 6),
      section("Prefix", 1),
      section("Protection", 20),
      section("Role", 11),
      section("SelfAssignedRoles", 9),
      section("ServerGreet", 8),
      section("ServerRecovery", 2),
      section("TimeZone", 2),
      section("VcRole", 3),
    ],
  }),

  err: reply("err 2001-0007", {
    color: OK,
    title: "2001-0007 / 0xE01",
    description: "Session count exceeded",
    fields: [
      { name: "Module", value: "Kernel (1)", inline: true },
      { name: "Description", value: "7", inline: true },
    ],
    footer: "Console: Switch",
  }),
  err2hex: reply("err2hex 2001-0007", confirm("0xE01")),
  hex2err: reply("hex2err 0xE01", confirm("2001-0007")),
  switchbrew: reply("switchbrew nca", {
    color: OK,
    author: "Search for: nca",
    description:
      "[NCA](https://switchbrew.org/wiki/NCA)\nThe NCA (Nintendo Content Archive) format is the container used for every content type on the Switch, with a header, section table and encrypted sections.\n\n[NCA Format](https://switchbrew.org/wiki/NCA_Format)\nDescribes the header layout, key area and section encryption used by NCA files.",
  }),
  analyselog: reply("analyselog", {
    color: "#4a90e2",
    title: "The Legend of Zelda: Tears of the Kingdom",
    footer: "Log uploaded by SylveonDeko",
    fields: [
      {
        name: "General Info",
        value: "**Version:** 1.2.82 | **Firmware:** 18.1.0 | **CPU:** AMD Ryzen 7 5800X | **GPU:** NVIDIA GeForce RTX 3070 | **RAM:** 32.0 GB | **OS:** Linux 6.8.0",
      },
      {
        name: "System Settings",
        value: "**Audio Backend:** `SDL2`\n**Console Mode:** `Docked`\n**PPTC Cache:** `Enabled`\n**Shader Cache:** `Enabled`\n**V-Sync:** `Enabled`\n**Hypervisor:** `N/A`",
        inline: true,
      },
      {
        name: "Graphics Settings",
        value: "**Graphics Backend:** `Vulkan`\n**Resolution:** `Native`\n**Anisotropic Filtering:** `Auto`\n**Aspect Ratio:** `16:9`\n**Texture Recompression:** `Disabled`",
        inline: true,
      },
      { name: "Latest Error Snippet", value: "No errors found in log" },
      { name: "Mods", value: "No mods found" },
      { name: "Cheats", value: "No cheats found" },
      { name: "Notes", value: "ℹ️ Time elapsed: `01:12:44`" },
    ],
  }),

  highlights: chat(
    "general",
    sylveon("highlights add pokemon"),
    bot(confirm("Added `pokemon` to your highlights!")),
    sylveon("highlights list"),
    bot({ color: OK, title: "2 Highlights", description: "1. mewdeko\n2. pokemon", footer: pageOf(1, 1) }),
  ),
};
