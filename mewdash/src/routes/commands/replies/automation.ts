import { ago, type ChatEmbed, type ChatEmbedField } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, bot, chat, confirm, MEMBER, OK, reply, sylveon, TIME, USERNAME, type CommandPreview } from "./chat";

const BLANK = "​";
const ctId = 12;
const GOLD = "#f1c40f";
const GREEN = "#2ecc71";
const BLUE = "#3498db";
const RED = "#e74c3c";
const PURPLE = "#9b59b6";
const ORANGE = "#e67e22";

/** `ReplyConfirmAsync`: the confirm embed led by the bolded caller. */
const replyConfirm = (text: string) => confirm(`**${USERNAME}** ${text}`);

/** `ChatTriggersService.GetEmbed`: the trigger card, with optional fields before and after the valid types. */
const trigger = (
  title: string | undefined,
  extra: ChatEmbedField[] = [],
  options: { name?: string; response?: string; prefix?: string; types?: string; tail?: ChatEmbedField[] } = {},
): ChatEmbed => ({
  color: OK,
  ...(title ? { title } : {}),
  description: `#${ctId}`,
  fields: [
    { name: "Trigger", value: options.name ?? "hello" },
    { name: "Response", value: `\`\`\`${options.response ?? "Hello to you too!"}\`\`\`` },
    { name: "Prefix Type", value: options.prefix ?? "None" },
    ...extra,
    { name: "Valid Trigger Types", value: options.types ?? "Message" },
    ...(options.tail ?? []),
  ],
});

const ctEdit = (input: string, extra: ChatEmbedField[] = [], options: Parameters<typeof trigger>[2] = {}) =>
  reply(input, trigger("Chat Trigger Edited", extra, options));

const option = (input: string, name: string, state: "enabled" | "disabled" = "enabled") =>
  reply(input, replyConfirm(`\`${name}\` option is now ${state} for Chat Trigger with id \`${ctId}\`.`));

const todoSample = [
  "🔴 `14` **Fix login bug** ⏰ <t:7200:R>\n   _Users get a 500 after resetting a password_",
  "🟡 `15` **Update the rules page**",
  "🟢 `16` **Order new stickers**",
].join("\n");

const state = (title: string, color: string, reason: string) => ({
  color,
  author: "Biscuit",
  title,
  description: "Add a movie night voice channel",
  fields: [{ name: "Reason", value: reason }],
});

const suggestion = (command: string, title: string, color: string, reason: string, result: string) =>
  chat(
    "suggestions",
    bot(state(title, color, reason)),
    sylveon(`${command} 12 ${reason}`),
    bot(confirm(result)),
  );

const page = (title: string, lines: string[]): ChatEmbed => ({
  color: OK,
  title,
  description: lines.join("\n"),
  footer: "Page 1/1",
});

export const automationPreviews: Record<string, CommandPreview> = {
  addchattrigger: reply("addchattrigger hello Hello to you too!", trigger("New Chat Trigger")),
  addchattriggerregex: reply(
    "addchattriggerregex ^good (morning|night)$ Rest well!",
    trigger("New Chat Trigger", [], { name: "^good (morning|night)$", response: "Rest well!" }),
  ),
  addreactiontrigger: reply(
    "addreactiontrigger 🔥 That is hot!",
    trigger("New Reaction Trigger", [], { name: "🔥", response: "That is hot!", types: "Reactions" }),
  ),
  editchattrigger: reply(
    `editchattrigger ${ctId} Well hello there!`,
    trigger("Chat Trigger Edited", [], { response: "Well hello there!" }),
  ),
  showchattrigger: reply(`showchattrigger ${ctId}`, trigger(undefined)),
  deletechattrigger: chat("general", sylveon(`deletechattrigger ${ctId}`), bot({ text: "Chat Trigger deleted", embeds: [trigger(undefined)] })),
  listchattriggers: reply(
    "listchattriggers",
    page("Chat Triggers", ["`#12` hello", "🗑`#13` invite", "📪`#14` rules // 📜", "`#15` ^good (morning|night)$"]),
  ),
  listchattriggersgroup: reply(
    "listchattriggersgroup",
    page("Name", ["**^good (morning|night)$** `x1`", "**hello** `x2`", "**invite** `x1`", "**rules** `x1`"]),
  ),
  ctsreload: chat("general", { ...sylveon("ctsreload"), reactions: [{ emoji: "✅", count: 1, me: true }] }),
  ctsimport: chat("general", { ...sylveon("ctsimport crs-export.yml"), reactions: [{ emoji: "✅", count: 1, me: true }] }),
  ctsmigrate: chat(
    "general",
    sylveon("ctsmigrate"),
    bot("Here is a backup of your chat triggers before migration. Keep this file safe!"),
    bot(replyConfirm("Successfully migrated 6 out of 14 chat triggers to the new embed format.")),
  ),
  ctsclear: reply("ctsclear", replyConfirm("All 14 Chat Triggers on this server have been removed.")),
  ctreact: chat(
    "general",
    {
      ...sylveon(`ctreact ${ctId} 🔥 👍`),
      reactions: [
        { emoji: "🔥", count: 1, me: true },
        { emoji: "👍", count: 1, me: true },
      ],
    },
    bot(replyConfirm(`Chat Trigger with id **${ctId}** will add following reactions to the response message: 🔥, 👍`)),
  ),
  ctca: option("ctca 12", "ContainsAnywhere"),
  rtt: option("rtt 12", "ReactToTrigger"),
  ctdm: option("ctdm 12", "DmResponse"),
  ctad: option("ctad 12", "AutoDelete"),
  ctat: option("ctat 12", "AllowTarget"),
  ctnr: option("ctnr 12", "NoRespond", "disabled"),
  chattriggerrolegranttype: ctEdit(
    `chattriggerrolegranttype ${ctId} both`,
    [
      { name: "Added Roles", value: "@Member" },
      { name: "Role Grant Type", value: "Both" },
    ],
  ),
  ctrgranttoggle: reply(`ctrgranttoggle ${ctId} Member`, replyConfirm(`The role **Member** will be added when the trigger \`${ctId}\` is run.`)),
  ctrremovetoggle: reply(`ctrremovetoggle ${ctId} Muted`, replyConfirm(`The role **Muted** will be removed when the trigger \`${ctId}\` is run.`)),
  chattriggervalidtype: ctEdit(`chattriggervalidtype ${ctId} reactions true`, [], { types: "Message, Reactions" }),
  chattriggerscrosspostwebhook: ctEdit(
    `chattriggerscrosspostwebhook ${ctId} https://mewdeko.tech/api/webhooks/1234/abcd`,
    [],
    { tail: [{ name: "Crossposting", value: "To a webhook" }] },
  ),
  chattriggerscrosspostchannel: ctEdit(
    `chattriggerscrosspostchannel ${ctId} #announcements`,
    [],
    { tail: [{ name: "Crossposting", value: "To <#announcements>" }] },
  ),
  ctprefixtype: ctEdit(`ctprefixtype ${ctId} GuildOrGlobal`, [], { prefix: "GuildOrGlobal" }),
  ctprefix: ctEdit(`ctprefix ${ctId} ?`, [], { prefix: "Custom", tail: [{ name: "Custom Prefix", value: "?" }] }),
  ctevent: ctEdit(
    `ctevent ${ctId} MemberJoin`,
    [
      { name: "Event", value: "MemberJoin" },
      { name: "Event Channel", value: "Where the event happened" },
    ],
    { types: "Message, Event" },
  ),
  cteventchannel: ctEdit(
    `cteventchannel ${ctId} #welcome`,
    [
      { name: "Event", value: "MemberJoin" },
      { name: "Event Channel", value: "<#welcome>" },
    ],
    { types: "Message, Event" },
  ),
  ctreply: ctEdit(`ctreply ${ctId}`, [{ name: "Replies To Trigger", value: BLANK }]),
  ctdeleteafter: ctEdit(`ctdeleteafter ${ctId} 10`, [{ name: "Deletes Response After", value: "10s" }]),
  ctcooldown: ctEdit(`ctcooldown ${ctId} 30`, [
    { name: "Cooldown", value: "30s" },
    { name: "Cooldown Scope", value: "User" },
  ]),
  ctrequirecounter: ctEdit(`ctrequirecounter ${ctId} welcomes 0 100`, [
    { name: "Counter Requirement", value: "`welcomes` between 0 and 100" },
  ]),
  ctcategory: ctEdit(`ctcategory ${ctId} fun`, [{ name: "Category", value: "fun" }]),
  ctcategorytoggle: reply("ctcategorytoggle fun false", replyConfirm("3 trigger(s) in category `fun` are now disabled.")),
  ctallowbots: ctEdit(`ctallowbots ${ctId}`, [{ name: "Responds To Bots", value: BLANK }]),
  ctmatchembeds: ctEdit(`ctmatchembeds ${ctId}`, [{ name: "Matches Embeds", value: BLANK }]),
  ctchain: ctEdit(`ctchain ${ctId} 15`, [{ name: "Chains To", value: "15" }]),
  ctexpiry: ctEdit(`ctexpiry ${ctId} 7d`, [{ name: "Expires", value: "<t:604800:R>" }]),
  ctmaxuses: ctEdit(`ctmaxuses ${ctId} 100`, [{ name: "Max Uses", value: "0 / 100" }]),
  ctminage: ctEdit(`ctminage ${ctId} 7d`, [{ name: "Minimum Account Age", value: "7d" }]),
  ctminmember: ctEdit(`ctminmember ${ctId} 1d`, [{ name: "Minimum Server Membership", value: "1d" }]),
  ctresponsemode: ctEdit(`ctresponsemode ${ctId} Random`, [
    { name: "Response Mode", value: "Random" },
    { name: "Extra Responses", value: "2" },
  ]),
  ctcost: ctEdit(`ctcost ${ctId} 100`, [{ name: "Currency Cost", value: "100" }]),
  ctreward: ctEdit(`ctreward ${ctId} 250`, [{ name: "Currency Reward", value: "250" }]),
  ctxpreward: ctEdit(`ctxpreward ${ctId} 50`, [{ name: "XP Reward", value: "50" }]),
  ctreqlevel: ctEdit(`ctreqlevel ${ctId} 5`, [{ name: "Required XP Level", value: "5" }]),
  ctreqmsg: ctEdit(`ctreqmsg ${ctId} You need to be level 5 first!`, [
    { name: "Requirement Failure Message", value: "You need to be level 5 first!" },
  ]),
  cttoggle: reply(`cttoggle ${ctId}`, replyConfirm(`Chat trigger ${ctId} is now disabled.`)),
  cttime: reply(`cttime ${ctId} 09:00 17:30 Monday Friday`, replyConfirm(`Chat trigger ${ctId} is now only active between 09:00 and 17:30.`)),
  ctaddresponse: reply(`ctaddresponse ${ctId} Hi!`, replyConfirm(`Added an extra response to chat trigger ${ctId}. It now has 2 responses.`)),
  ctclearresponses: reply(`ctclearresponses ${ctId}`, replyConfirm(`Cleared the extra responses of chat trigger ${ctId}.`)),
  cttest: reply(`cttest ${ctId} hello there`, {
    color: OK,
    title: `Trigger Test: ${ctId}`,
    description: "Would fire and respond.",
    fields: [
      { name: "Trigger", value: "hello" },
      { name: "Matched", value: "Matched" },
      { name: "Response Preview", value: "Hello to you too!" },
    ],
  }),
  ctstats: reply(`ctstats ${ctId}`, {
    color: OK,
    title: `Trigger Activity: ${ctId}`,
    fields: [
      { name: "Total Fires", value: "1,284" },
      { name: "Recent Fires", value: `${AUTHOR} in <#general> ${ago(45)}\n${MEMBER} in <#general> ${ago(900)}` },
    ],
  }),
  ctplaceholders: reply("ctplaceholders", {
    color: OK,
    title: "Chat Trigger Placeholders",
    description: [
      "%achievements.points%",
      "%achievements.rank%",
      "%currency.balance%",
      "%currency.bank%",
      "%invites%",
      "%messages%",
      "%rep%",
      "%xp.level%",
      "%xp.rank%",
      "%xp.total%",
    ]
      .map((x) => `\`${x}\``)
      .join("\n"),
  }),
  ctcounters: reply("ctcounters", {
    color: OK,
    title: "Chat Trigger Counters",
    description: "`deaths`: 7\n`welcomes`: 128",
  }),
  ctcounterset: reply("ctcounterset welcomes 128", replyConfirm("Counter `welcomes` is now 128.")),
  ctcounterdelete: reply("ctcounterdelete welcomes", replyConfirm("Deleted counter `welcomes` and its 1 stored value(s).")),

  suggest: chat(
    "suggestions",
    sylveon("suggest Add a movie night voice channel"),
    bot(
      {
        color: OK,
        author: USERNAME,
        title: "Suggestion #12",
        description: "Add a movie night voice channel",
      },
      [
        { emoji: "👍", count: 1 },
        { emoji: "👎", count: 1 },
      ],
    ),
  ),
  setsuggestchannel: reply("setsuggestchannel #suggestions", confirm("Your Suggestion channel has been set to <#suggestions>")),
  suggestinfo: reply("suggestinfo 12", {
    color: OK,
    fields: [
      { name: "Suggestion", value: "Add a movie night voice channel \n[Jump To Suggestion](https://fluxer.app/channels/1/2/3)" },
      { name: "Suggested By", value: `${MEMBER} \`1521568983961042945\`` },
      { name: "Curerent State", value: "Pending" },
      { name: "Last Changed By", value: "Nobody" },
      { name: "State Change Count", value: "0" },
      { name: "Emoji Count", value: "👍 `7`\n👎 `1`" },
    ],
  }),
  suggestclear: reply("suggestclear", confirm("Suggestions cleared.")),
  accept: suggestion("accept", "Suggestion #12 Accepted", BLUE, "Great idea, we will add it", "Suggestion set as accepted and the user has been DMed."),
  deny: suggestion("deny", "Suggestion #12 Denied", RED, "We already have enough voice channels", "Suggestion set as denied and the user has been DMed."),
  consider: suggestion("consider", "Suggestion #12 Considered", GOLD, "We will talk about it in the next staff meeting", "Suggestion set as considered and the user has been DMed."),
  implemented: suggestion("implemented", "Suggestion #12 Implemented", GREEN, "Movie Night is live now", "Suggestion set as implemented and the user has been DMed."),
  suggestmessage: reply("suggestmessage -", confirm("Suggestions will now have the default look.")),
  acceptmessage: reply("acceptmessage -", confirm("Accepted suggestions will now have the default look.")),
  denymessage: reply("denymessage -", confirm("Denied suggestions will now have the default look.")),
  considermessage: reply("considermessage -", confirm("Considered suggestions will now have the default look.")),
  implementmessage: reply("implementmessage -", confirm("Implemented suggestions will now have the default look.")),
  minsuggestionlength: reply("minsuggestionlength 20", confirm("Minimum length set to 20 characters!")),
  maxsuggestionlength: reply("maxsuggestionlength 500", confirm("Max length set to 500 characters!")),
  acceptchannel: reply("acceptchannel #accepted", confirm("Accept channel set to <#accepted>")),
  denychannel: reply("denychannel #denied", confirm("Deny channel set to <#denied>")),
  considerchannel: reply("considerchannel #considering", confirm("Consider channel set to <#considering>")),
  implementchannel: reply("implementchannel #implemented", confirm("Implement channel set to <#implemented>")),
  suggestthreadstype: reply("suggestthreadstype Public", confirm("Successfully set Suggestion Threads Type to `Public`")),
  archiveondeny: reply("archiveondeny", confirm("Archive on deny is now set to `True`")),
  archiveonaccept: reply("archiveonaccept", confirm("Archive on accept is now set to `True`")),
  archiveonconsider: reply("archiveonconsider", confirm("Archive on consider is now set to `True`")),
  archiveonimplement: reply("archiveonimplement", confirm("Archive on implement is now set to `True`")),
  suggestmotes: chat(
    "general",
    {
      ...sylveon("suggestmotes 🔥 ❤️"),
      reactions: [
        { emoji: "🔥", count: 1, me: true },
        { emoji: "❤️", count: 1, me: true },
      ],
    },
    bot(confirm("Suggestions will now be reacted with 🔥,❤️")),
  ),

  todocreatelist: reply("todocreatelist Release Tasks for the next release", {
    color: GREEN,
    title: "📝 Todo list created successfully!",
    description: "**Release**\nTasks for the next release",
    timestamp: TIME,
  }),
  todocreateserverlist: reply("todocreateserverlist Roadmap Plans for the whole server", {
    color: BLUE,
    title: "🌐 Server todo list created successfully!",
    description: "**Roadmap**\nPlans for the whole server",
    timestamp: TIME,
  }),
  todolists: reply("todolists", {
    color: PURPLE,
    title: "📋 Your Todo Lists",
    description: "👤🔒 **Release** (ID: 3)\n   _Tasks for the next release_\n\n🌐👁️ **Roadmap** (ID: 4)\n   _Plans for the whole server_\n",
    footer: "Use todo show <list-id> to view items",
  }),
  todoadd: reply("todoadd 3 Fix login bug Users get a 500 after resetting a password", {
    color: GREEN,
    title: "Todo item added successfully!",
    description: "**Fix login bug**\nUsers get a 500 after resetting a password",
    timestamp: TIME,
  }),
  todoaddpriority: reply("todoaddpriority 3 4 Fix login bug Users get a 500 after resetting a password", {
    color: GREEN,
    title: "Todo item added successfully!",
    description: "**Fix login bug** (🔴 Critical)\nUsers get a 500 after resetting a password",
    timestamp: TIME,
  }),
  todoshow: reply("todoshow 3", {
    color: "#7289da",
    title: "📝 Release",
    description: `**📌 Pending Items (3)**\n${todoSample}\n`,
    footer: "Use /todo add 3 <title> to add items",
  }),
  todocomplete: reply("todocomplete 14", confirm("Todo item marked as completed!")),
  tododelete: reply("tododelete 16", confirm("🗑️ Todo item deleted successfully!")),
  tododeletelist: reply("tododeletelist 3", confirm("🗑️ Todo list deleted successfully!")),
  todogrant: reply(`todogrant 3 ${MEMBER} view,add,complete`, confirm(`Permissions granted to ${MEMBER}: view, add, complete`)),
  todorevoke: reply(`todorevoke 3 ${MEMBER}`, confirm(`🗑️ Permissions revoked for ${MEMBER}`)),
  todosetdue: reply("todosetdue 14 2026-11-10 18:00", confirm("📅 Due date set to 2026-11-10 18:00")),
  todocleardue: reply("todocleardue 14", confirm("🗑️ Due date cleared successfully")),
  todosetreminder: reply("todosetreminder 14 2026-11-09 09:00", confirm("⏰ Reminder set for 2026-11-09 09:00")),
  todoclearreminder: reply("todoclearreminder 14", confirm("🔕 Reminder cleared successfully")),
  todoaddtag: reply("todoaddtag 14 bug", confirm("🏷️ Tag 'bug' added successfully")),
  todoremovetag: reply("todoremovetag 14 bug", confirm("🗑️ Tag 'bug' removed successfully")),
  todoedit: reply("todoedit 14 Fix login crash", confirm("✏️ Todo item edited successfully")),
  todoreorder: reply("todoreorder 15 1", confirm("🔄 Todo item moved to position 1")),
  todosetcolor: reply("todosetcolor 3 #ff8800", confirm("🎨 List color set to #ff8800")),
  todotoggleprivacy: reply("todotoggleprivacy 3", confirm("🔒 List is now public")),
  todopermissions: reply("todopermissions 3", {
    color: BLUE,
    title: "🔐 Todo List Permissions",
    description: "**Biscuit**: view, add, complete\n",
  }),
  todosearch: reply("todosearch 3 login", {
    color: ORANGE,
    title: "🔍 Search Results",
    description: "**Found 1 items matching 'login'**\n🔴 `14` **Fix login bug** ⏰ <t:7200:R>\n   _Users get a 500 after resetting a password_\n",
  }),
  todofilter: reply("todofilter 3 priority 4", {
    color: GOLD,
    title: "🔍 Filter Results",
    description: "**Found 1 items with priority '4'**\n🔴 `14` **Fix login bug** [bug, auth] ⏰ <t:7200:R>\n   _Users get a 500 after resetting a password_\n",
  }),

  twitchset: reply("twitchset sylveondeko", confirm("Now connected to Twitch channel **sylveondeko**. Command prefix: `!`")),
  twitchremove: reply("twitchremove", confirm("Disconnected from Twitch channel **sylveondeko**.")),
  twitchenable: reply("twitchenable", confirm("Twitch integration enabled.")),
  twitchdisable: reply("twitchdisable", confirm("Twitch integration disabled.")),
  twitchconfig: reply("twitchconfig", {
    color: OK,
    title: "Twitch Configuration",
    fields: [
      { name: "Channel", value: "#sylveondeko", inline: true },
      { name: "Command Prefix", value: "`!`", inline: true },
      { name: "Enabled", value: "Yes", inline: true },
      { name: "Go-Live Channel", value: "<#stream-alerts>", inline: true },
      { name: "Language", value: "en", inline: true },
    ],
  }),
  twitchstatus: reply("twitchstatus", {
    color: OK,
    title: "Twitch Status",
    description: [
      "```Channel: #sylveondeko",
      "Enabled: True",
      "EventSub: enabled, last event 2026-11-03 17:48:12Z",
      "Bot account: mewdekobot, token expires 2026-12-01 09:30:00Z",
      "Channel auth: sylveondeko, token expires 2026-12-01 09:31:12Z",
      "Custom commands: 4",
      "Role sync mappings: 2",
      "Redemption actions: 1",
      "Recaps: enabled```",
    ].join("\n"),
  }),
  twitchprefix: reply("twitchprefix ?", confirm("Twitch command prefix updated to `?`.")),
  twitchlanguage: reply("twitchlanguage en", confirm("Twitch channel language set to `en`.")),
  twitchstreaminfo: reply('twitchstreaminfo "Chill Friday stream" "Just Chatting"', confirm("Twitch stream info updated.")),
  twitchclip: reply("twitchclip", confirm("Created Twitch clip: https://clips.twitch.tv/BrightTastyOtterAMPEnergy")),
  twitchlink: reply(`twitchlink ${MEMBER} biscuit_plays`, confirm(`Linked **${MEMBER}** to Twitch account **biscuit_plays**.`)),
  twitchunlink: reply(`twitchunlink ${MEMBER}`, confirm(`Unlinked Discord account for **${MEMBER}**.`)),
  twitchlinks: reply("twitchlinks", page("Twitch Account Links", [`${MEMBER} → **biscuit_plays**`, `${AUTHOR} → **sylveondeko**`])),
  twitchclaim: reply("twitchclaim K7F2QX", confirm("Linked your Discord account to Twitch account **sylveondeko**.")),
  twitchcommandadd: reply("twitchcommandadd lurk \"Thanks for lurking!\" Everyone 5", confirm("Saved Twitch chat command **lurk**.")),
  twitchcommandremove: reply("twitchcommandremove lurk", confirm("Removed Twitch chat command **lurk**.")),
  twitchcommandlist: reply(
    "twitchcommandlist",
    page("Twitch Chat Commands", ["`lurk` - Everyone, cooldown 5s, used 42 times", "`discord` - Everyone, cooldown 30s, used 118 times"]),
  ),
  twitchcounterset: reply("twitchcounterset deaths 7", confirm("Set Twitch counter **deaths** to `7`.")),
  twitchcounterlist: reply("twitchcounterlist", page("Twitch Counters", ["`deaths`: 7", "`wins`: 3"])),
  twitchscheduleset: reply("twitchscheduleset Streams run Monday to Friday at 6 PM", confirm("Twitch schedule response saved.")),
  twitchscheduleclear: reply("twitchscheduleclear", confirm("Twitch schedule response cleared.")),
  twitchsocialsset: reply("twitchsocialsset Find me at twitter.com/sylveondeko", confirm("Twitch socials response saved.")),
  twitchsocialsclear: reply("twitchsocialsclear", confirm("Twitch socials response cleared.")),
  twitchtimeradd: reply("twitchtimeradd hydrate \"Remember to drink some water!\" 15", confirm("Saved Twitch timer **hydrate**.")),
  twitchtimerremove: reply("twitchtimerremove hydrate", confirm("Removed Twitch timer **hydrate**.")),
  twitchtimerlist: reply(
    "twitchtimerlist",
    page("Twitch Timers", ["**hydrate** - every 15m, min chat 5, online only, Enabled", "**follow** - every 30m, min chat 10, always, Disabled"]),
  ),
  twitchtimerenable: reply("twitchtimerenable hydrate", confirm("Enabled Twitch timer **hydrate**.")),
  twitchtimerdisable: reply("twitchtimerdisable hydrate", confirm("Disabled Twitch timer **hydrate**.")),
  twitchtimertest: reply("twitchtimertest hydrate", confirm("Sent timer message:\nRemember to drink some water!")),
  twitchgolive: reply("twitchgolive #stream-alerts", confirm("Go-live notifications will be posted in <#stream-alerts>.")),
  twitchgoliveclear: reply("twitchgoliveclear", confirm("Go-live notification channel cleared.")),
  twitchsubchannel: reply("twitchsubchannel #stream-alerts", confirm("Twitch subscription notifications will be posted in <#stream-alerts>.")),
  twitchsubclear: reply("twitchsubclear", confirm("Twitch subscription notifications disabled.")),
  twitchraidchannel: reply("twitchraidchannel #stream-alerts", confirm("Twitch raid notifications will be posted in <#stream-alerts>.")),
  twitchraidclear: reply("twitchraidclear", confirm("Twitch raid notifications disabled.")),
  twitchrecapchannel: reply("twitchrecapchannel #stream-alerts", confirm("Stream recaps will be posted in <#stream-alerts>.")),
  twitchrecapclear: reply("twitchrecapclear", confirm("Stream recaps disabled.")),
  twitchrolesyncadd: reply("twitchrolesyncadd Subscriber Twitch Sub", confirm("Synced Twitch rank **Subscriber** to @Twitch Sub.")),
  twitchrolesyncremove: reply("twitchrolesyncremove Subscriber Twitch Sub", confirm("Removed Twitch rank **Subscriber** sync from @Twitch Sub.")),
  twitchrolesynclist: reply("twitchrolesynclist", page("Twitch Role Sync", ["**Subscriber** → @Twitch Sub", "**Mod** → @Stream Mod"])),
  twitchredemptionadd: reply("twitchredemptionadd Hydrate \"Gulp!\" #stream-alerts", confirm("Saved channel point action for reward **Hydrate**.")),
  twitchredemptionremove: reply("twitchredemptionremove Hydrate", confirm("Removed channel point action for reward **Hydrate**.")),
  twitchredemptionlist: reply(
    "twitchredemptionlist",
    page("Twitch Redemption Actions", ["**Hydrate** - Discord: <#stream-alerts>, Twitch reply: Yes"]),
  ),
  twitchraidtargetadd: reply("twitchraidtargetadd shinyhunter Friendly neighbors", confirm("Saved Twitch raid target **shinyhunter**.")),
  twitchraidtargetremove: reply("twitchraidtargetremove shinyhunter", confirm("Removed Twitch raid target **shinyhunter**.")),
  twitchraidtargetlist: reply("twitchraidtargetlist", page("Twitch Raid Targets", ["**shinyhunter** - Friendly neighbors", "**cozycat** - -"])),
};
