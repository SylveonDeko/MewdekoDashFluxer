import { ago } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, ERROR, MEMBER, OK, USERNAME, chat, confirm, error, reply, sylveon, type CommandPreview } from "./chat";

const PANEL = "1521600412345678901";
const NEW_PANEL = "1521600987654321098";

/** `ReplyConfirmAsync`: the command author's name in bold ahead of the text. */
const replyConfirm = (text: string) => confirm(`**${USERNAME}** ${text}`);

/** `SuccessAsync`: the success emote ahead of the text. */
const success = (text: string) => confirm(`✅ ${text}`);

/** `ErrorAsync`: the error emote ahead of the text. */
const fail = (text: string) => error(`❌ ${text}`);

/** A command the bot answers with a checkmark reaction on the message itself. */
const reacted = (input: string): CommandPreview =>
  chat("general", { ...sylveon(input), reactions: [{ emoji: "✅", count: 1, me: true }] });

const warnedOn = "On November 2, 2026 at 6:12 PM by";

export const moderationPreviews: Record<string, CommandPreview> = {
  banpruneset: reply("banpruneset ban 3", success("Bans from Ban now purge **3 day(s) of messages** for this community.")),
  banprunereset: reply("banprunereset", success("Removed 2 purge settings. Every action is back to its default.")),
  banpruneclear: reply("banpruneclear ban", confirm("Cleared the purge setting for Ban in this community.")),
  banprune: reply("banprune", {
    color: OK,
    title: "Ban message purge",
    description: "A ban here right now purges **3 day(s) of messages**.",
    fields: [
      { name: "Defaults", value: "Ban: **3 day(s) of messages**\nSoftban: **7 day(s) of messages**" },
      { name: "Overrides", value: "channel <#spam> / Ban: **no messages**" },
    ],
  }),

  mute: reply(`mute ${MEMBER} spamming`, replyConfirm("**Biscuit** has been **muted** from text and voice chat.")),
  unmute: reply(`unmute ${MEMBER}`, replyConfirm("**Biscuit** has been **unmuted** from text and voice chat.")),
  chatmute: reply(`chatmute ${MEMBER}`, replyConfirm("**Biscuit** has been **muted** from chatting.")),
  chatunmute: reply(`chatunmute ${MEMBER}`, replyConfirm("**Biscuit** has been **unmuted** from chatting.")),
  voicemute: reply(`voicemute ${MEMBER}`, replyConfirm("**Biscuit** has been **voice muted**.")),
  voiceunmute: reply(`voiceunmute ${MEMBER}`, replyConfirm("**Biscuit** has been **voice unmuted**.")),
  stfu: reply(`stfu ${MEMBER}`, confirm("Biscuit has been muted in this channel!")),
  unstfu: reply(`unstfu ${MEMBER}`, confirm("Biscuit has been unmuted in this channel!")),
  muterole: reply("muterole", replyConfirm("Current mute role is @Muted")),
  removeonmute: reply("removeonmute yes", confirm("Removing roles on mute has been enabled!")),
  unmuteall: reply("unmuteall", confirm("Unmuted all users!")),

  timeout: reply(`timeout 1h ${MEMBER} spamming`, replyConfirm(`Timeout enabled for ${MEMBER} and set to 1 hour.`)),
  untimeout: reply(`untimeout ${MEMBER}`, replyConfirm(`Timeout removed for ${MEMBER}.`)),

  warn: reply(`warn ${MEMBER} spamming`, confirm("User **Biscuit** has been warned.")),
  warnlog: reply(`warnlog ${MEMBER}`, {
    color: OK,
    title: "Warnlog for Biscuit",
    fields: [
      { name: `#\`1\` ${warnedOn} ${USERNAME}`, value: "Spamming in #general" },
      { name: `#\`2\` ~~${warnedOn} ${USERNAME}~~ cleared by ${USERNAME}`, value: "No reason provided" },
    ],
    footer: "page 1",
  }),
  warnlogall: reply("warnlogall", {
    color: OK,
    title: "List of all warned users on the community",
    description: "Biscuit | 2 (3 - 1)\nHazel | 1 (1 - 0)",
  }),
  warnclear: reply(`warnclear ${MEMBER}`, replyConfirm("All warnings have been cleared for Biscuit.")),
  warnexpire: reply("warnexpire 30 clear", replyConfirm("Warnings will be cleared after **30** days.")),
  warnpunish: reply("warnpunish 3 mute 30m", replyConfirm("I will apply **Mute** punishment for **30m** to users with **3** warnings.")),
  warnpunishlist: reply("warnpunishlist", confirm("3 -> Mute  30m \n5 -> Ban  ", "Warning punishment list")),
  setwarnchannel: reply("setwarnchannel #mod-logs", confirm("Your warnlog channel has been set to <#mod-logs>")),

  mwarn: reply(`mwarn ${MEMBER} talking over others`, replyConfirm("**Biscuit** has been mini warned")),
  mwarnlog: reply(`mwarnlog ${MEMBER}`, {
    color: OK,
    title: "Mini Warning Log for Biscuit",
    fields: [{ name: `#\`1\` Mini warned on November 2, 2026 at 6:12 PM by ${USERNAME}`, value: "Talking over others" }],
    footer: "Page 1",
  }),
  mwarnlogall: reply("mwarnlogall", {
    color: OK,
    title: "Mini Warnings List",
    description: "Biscuit | 1 (1 - 0)\nHazel | 2 (2 - 0)",
  }),
  mwarnclear: reply(`mwarnclear ${MEMBER}`, replyConfirm("All mini warnings cleared for **Biscuit**")),
  mwarnexpire: reply("mwarnexpire 14", replyConfirm("Mini warnings will now automatically clear after **14** days")),
  mwarnpunish: reply("mwarnpunish 3 timeout 1h", replyConfirm("I will apply **Timeout** punishment for **1h** to users with **3** warnings.")),
  mwarnpunishlist: reply("mwarnpunishlist", confirm("3 -> Timeout  60m ", "Mini Warning Punishment List")),
  setmwarnchannel: reply("setmwarnchannel #mod-logs", confirm("Your mini warning log channel has been set to <#mod-logs>")),

  ban: reply(`ban ${MEMBER} advertising`, {
    color: OK,
    title: "⛔️ User Banned",
    fields: [
      { name: "Username", value: "Biscuit", inline: true },
      { name: "ID", value: "1521570000000000003", inline: true },
    ],
  }),
  unban: reply("unban Biscuit", replyConfirm("User **Biscuit** has been unbanned.")),
  softban: reply(`softban ${MEMBER} spamming`, {
    color: OK,
    title: "☣ User soft-banned",
    fields: [
      { name: "Username", value: "Biscuit", inline: true },
      { name: "ID", value: "1521570000000000003", inline: true },
    ],
  }),
  kick: reply(`kick ${MEMBER} breaking the rules`, {
    color: OK,
    title: "User kicked",
    fields: [
      { name: "Username", value: "Biscuit", inline: true },
      { name: "ID", value: "1521570000000000003", inline: true },
    ],
  }),
  masskick: reply(`masskick ${MEMBER} 1521570000000000007 1521570000000000009`, {
    color: OK,
    title: "Mass Kick",
    description: "Kicked `3` members!",
  }),
  masskill: reply("masskill 1521570000000000011 1521570000000000013 spambot", {
    color: OK,
    description: "Mass Banning and Blacklisting of 2 users is complete.",
    fields: [{ name: "Invalid / Can't be found (0)", value: "-" }],
  }),
  banmessage: reply("banmessage", replyConfirm("No ban message set. Default behavior will be used.")),
  banmsgreset: reacted("banmsgreset"),
  banmsgtest: reacted("banmsgtest testing the ban message"),

  purgeuser: reply(`purgeuser ${MEMBER} 100`,
    confirm(`Searching the last 100 messages in all channels to purge messages from ${MEMBER}....`),
    confirm(`Deleted 14 messages from ${MEMBER} in 3 channels.`)),

  dehoist: reply(`dehoist ${MEMBER}`, confirm(`User ${MEMBER} has been dehoisted. Their new nickname is: \`Biscuit\``)),
  dehoistall: reply("dehoistall",
    confirm("Dehoisting 12 users. This may take a while."),
    confirm("Dehoisting operation completed.\nDehoisted 12 users.\nFailed to dehoist 0 users.")),
  sanitize: reply(`sanitize ${MEMBER}`, confirm(`User ${MEMBER} has been sanitized. Their new nickname is: \`Biscuit\``)),
  sanitizeall: reply("sanitizeall",
    confirm("Sanitizing 5 users. This may take a while."),
    confirm("Sanitizing operation completed.\nSanitized 5 users.\nFailed to sanitize 0 users.")),
  massnickprogress: reply("massnickprogress", {
    color: OK,
    title: "Dehoist Progress",
    description: `\`Started By:\` ${AUTHOR} | 1521568983961042944\n\`Total:\` 120\n\`Changed:\` 74\n\`Failed:\` 2\n\`Started At:\` ${ago(45)}`,
  }),
  massnickstop: reply("massnickstop", confirm("Stopping mass nick.")),

  confess: reply("confess 1521570000000000021 I still use light mode in my editor",
    confirm("Your confession has been sent! Please keep in mind if the community is abusing confessions you can send in a report using `/confessions report`")),
  confesschannel: reply("confesschannel #confessions", confirm("Set <#confessions> as the Confession Channel!")),
  confesslogchannel: reply("confesslogchannel #confession-logs",
    fail("Set <#confession-logs> as the Confession Log Channel. \n***Keep in mind if I find you misusing this function I will find out, blacklist this community. And use your spleen to take over the world")),
  confessblacklist: reply(`confessblacklist ${MEMBER}`, confirm(`Added ${MEMBER} to the confession blacklist!!`)),
  confessunblacklist: reply(`confessunblacklist ${MEMBER}`, confirm(`Removed ${MEMBER} from the confession blacklist!!`)),
  confessreport: reply("confessreport 1521570000000000021 Confessions are being used to harass members",
    error("Report sent. If you want to join and add on to it use the link below.")),

  channelaccesssetup: reply("channelaccesssetup #staff-lounge @Trusted",
    confirm("Applications for <#staff-lounge> are now open. Approved applicants get @Trusted.")),
  channelaccessremove: reply("channelaccessremove #staff-lounge", confirm("Removed the access gate from <#staff-lounge>.")),
  channelaccesslist: reply("channelaccesslist", {
    color: OK,
    title: "Channel access gates",
    fields: [
      {
        name: "#1 • <#staff-lounge>",
        value: "Grants: @Trusted\nThresholds: ✅ 3 / ❌ 2\nWindow: 48h (Deny on expiry)\nStatus: open",
      },
      {
        name: "#2 • <#vip>",
        value: "Grants: direct channel access (no role)\nThresholds: ✅ 2 / ❌ 1\nWindow: no limit (StayOpen on expiry)\nStatus: closed",
      },
    ],
  }),
  channelaccessconfig: reply("channelaccessconfig #staff-lounge approvals 3", confirm("Gate settings updated.")),
  channelaccesspanel: reply("channelaccesspanel #staff-lounge #apply", confirm("Apply panel posted in <#apply>.")),
  channelaccessquestionadd: reply("channelaccessquestionadd #staff-lounge Why do you want access to this channel?",
    confirm("Question added.")),
  channelaccessquestionremove: reply("channelaccessquestionremove #staff-lounge 2", confirm("Question removed.")),
  channelaccessquestionlist: reply("channelaccessquestionlist #staff-lounge", {
    color: OK,
    title: "Application questions for <#staff-lounge>",
    description: "`1.` Why do you want access to this channel?\n`2.` How long have you been in the community? *(optional)*",
  }),
  channelaccesswithdraw: reply("channelaccesswithdraw 12", confirm("Application #12 was withdrawn.")),
  channelaccesshistory: reply("channelaccesshistory", {
    color: OK,
    title: `Application history for ${USERNAME}`,
    description: `\`#12\` <#staff-lounge> • **Approved** • ${ago(86400 * 6)}\n\`#9\` <#vip> • **Denied** • ${ago(86400 * 21)}`,
  }),
  channelaccesspending: reply("channelaccesspending", {
    color: OK,
    title: "Open access applications",
    description: `\`#14\` ${MEMBER} → <#staff-lounge> • ✅ 2 ❌ 0\n\`#15\` <@sylveon> → <#vip> • ✅ 0 ❌ 1`,
  }),
  channelaccessbreakdown: reply("channelaccessbreakdown 14", {
    color: OK,
    title: "Vote breakdown for application #14",
    description: `✅ ${AUTHOR}\n✅ ${MEMBER}\n❌ <@bot>`,
  }),
  channelaccessapprove: reply("channelaccessapprove 14 Vouched for by two members", confirm("Application #14 was approved.")),
  channelaccessdeny: reply("channelaccessdeny 15 Account is too new", confirm("Application #15 was denied.")),
  channelaccessblacklistadd: reply(`channelaccessblacklistadd ${MEMBER}`, confirm(`${MEMBER} can no longer apply for channel access.`)),
  channelaccessblacklistremove: reply(`channelaccessblacklistremove ${MEMBER}`, confirm(`${MEMBER} can apply for channel access again.`)),
  channelaccessblacklist: reply("channelaccessblacklist", {
    color: ERROR,
    title: "Blocked applicants",
    description: `${MEMBER} • all gates\n<@sylveon> • <#vip>`,
  }),

  ticketpanel: reply("ticketpanel #support", confirm("<#support> Ticket Panel Created!")),
  ticketaddbutton: reply(`ticketaddbutton ${PANEL} General Support 🎫`, confirm(`Added button 'General Support' to panel #${PANEL}`)),
  ticketpaneldelete: reply(`ticketpaneldelete ${PANEL}`, confirm(`Ticket panel #${PANEL} has been deleted`)),
  ticketcategory: reply("ticketcategory 1 #Support Tickets", confirm("Ticket category for panel #1 set to Support Tickets")),
  ticketarchivecategory: reply("ticketarchivecategory 1 #Archived Tickets", confirm("Archive category for panel #1 set to Archived Tickets")),
  ticketthreadchannel: reply("ticketthreadchannel 1 #support-threads",
    confirm("Tickets from button 1 now open as private threads in <#support-threads>.")),
  ticketclaim: reply("ticketclaim", confirm(`Ticket claimed by ${AUTHOR}`)),
  ticketunclaim: reply("ticketunclaim", confirm("Ticket Unclaimed")),
  ticketclose: reply("ticketclose", confirm("Ticket has been closed")),
  ticketarchive: reply("ticketarchive", confirm("Ticket has been archived")),
  ticketautoarchive: reply("ticketautoarchive 1 true", confirm("Auto Archive on close has been enabled for button 1")),
  ticketclosebehavior: reply("ticketclosebehavior 1 true false", confirm("Updated 2 close behavior settings for button 1")),
  ticketautoclose: reply("ticketautoclose 1 24", confirm("Auto-close time set to 24 hours")),
  ticketresponsetime: reply("ticketresponsetime 1 30", confirm("Response time set to 30 minutes")),

  ticketcreatecase: reply("ticketcreatecase Refund dispute Customer says they were charged twice", confirm("Created case #4")),
  ticketlinkcase: reply("ticketlinkcase 4", confirm("Ticket linked to case #4")),
  ticketunlinkcase: reply("ticketunlinkcase", confirm("Ticket unlinked from case")),
  ticketviewcase: reply("ticketviewcase 4", {
    color: OK,
    title: "Case #4: Refund dispute",
    description: "Customer says they were charged twice",
    fields: [
      { name: "Created By", value: AUTHOR, inline: true },
      { name: "Created at", value: "11/2/2026 6:12 PM", inline: true },
      { name: "Status", value: "Open", inline: true },
      { name: "Linked Tickets", value: "#12\n#15" },
      { name: "Notes", value: `Payment provider confirmed one charge\n- ${AUTHOR} at 11/2/2026 7:40 PM` },
    ],
  }),
  ticketnotecase: reply("ticketnotecase 4 Payment provider confirmed one charge", confirm("Note added to case #4.")),
  ticketclosecase: reply("ticketclosecase 4", confirm("Case #4 closed.")),
  ticketreopencase: reply("ticketreopencase 4", confirm("Case #4 reopened.")),
  ticketupdatecase: reply("ticketupdatecase 4 Duplicate charge Refund issued", confirm("Case #4 updated.")),
  ticketlinktickets: reply("ticketlinktickets 4 12 15", confirm("Linked 2 ticket(s) to case #4.")),
  ticketunlinktickets: reply("ticketunlinktickets 4 15", confirm("Unlinked 1 ticket(s) from case #4.")),
  ticketnote: reply("ticketnote Waiting on the payment provider", confirm("Note added to ticket")),

  ticketpriority: reply("ticketpriority high", confirm("Ticket priority set to high")),
  ticketaddpriority: reply("ticketaddpriority urgent Urgent 🔥 3 true", confirm("Created new priority level 'Urgent'")),
  ticketremovepriority: reply("ticketremovepriority urgent", confirm("Deleted priority level 'urgent'")),
  ticketaddtag: reply("ticketaddtag billing Billing Payment questions #3498db", confirm("Created new tag 'Billing'")),
  ticketremovetag: reply("ticketremovetag billing", confirm("Deleted tag 'billing'")),
  ticketaddtags: reply("ticketaddtags billing refund", confirm("Tags added to ticket")),
  ticketremovetags: reply("ticketremovetags refund", confirm("Tags removed from ticket")),
  ticketblock: reply(`ticketblock ${MEMBER} opening spam tickets`, confirm(`${MEMBER} has been blocked from creating tickets`)),
  ticketunblock: reply(`ticketunblock ${MEMBER}`, confirm(`${MEMBER} has been unblocked from creating tickets`)),

  recreatepanel: reply(`recreatepanel ${PANEL}`,
    confirm(`Successfully recreated panel in <#support>!\nOld Message ID: ${PANEL}\nNew Message ID: ${NEW_PANEL}`)),
  recreateallpanels: reply("recreateallpanels", {
    color: OK,
    title: "Panel Recreation Complete",
    fields: [
      { name: "Recreated", value: "2", inline: true },
      { name: "Failed", value: "0", inline: true },
    ],
  }),
  checkpanels: reply("checkpanels", {
    color: OK,
    title: "Panel Status Check",
    description: `✅ Panel ${PANEL}: OK in #support\n❌ Panel ${NEW_PANEL}: Message missing in #billing`,
    fields: [
      {
        name: "Missing Panels",
        value: "1 panel(s) have missing messages.\nUse `.recreateallpanels` to recreate them all, or\n`.recreatepanel <panelId>` for individual panels.",
      },
    ],
  }),
  ticketduplicatepanel: reply(`ticketduplicatepanel ${PANEL} #billing`, confirm(`Panel #${PANEL} duplicated to <#billing>`)),
  ticketupdatepanel: reply(`ticketupdatepanel ${PANEL} {"title":"Open a ticket"}`, confirm("Panel updated successfully")),
  ticketmovepanel: reply(`ticketmovepanel ${PANEL} #billing`, confirm(`Panel #${PANEL} moved to <#billing>`)),
  ticketmoveall: reply("ticketmoveall #Support Tickets #Archived Tickets",
    confirm("Moved 8 tickets from Support Tickets to Archived Tickets (0 failed)")),
  ticketcloseinactive: reply("ticketcloseinactive 48", confirm("Closed 3 inactive tickets (over 48 hours old, 0 failed)")),
  tickettranscriptchannel: reply("tickettranscriptchannel #transcripts", confirm("Transcript channel set to <#transcripts>")),
  ticketlogchannel: reply("ticketlogchannel #ticket-logs", confirm("Log channel set to <#ticket-logs>")),
  ticketstats: reply("ticketstats", {
    color: OK,
    title: "Ticket Statistics",
    fields: [
      { name: "Total Tickets", value: "48", inline: true },
      { name: "Open Tickets", value: "6", inline: true },
      { name: "Closed Tickets", value: "42", inline: true },
      { name: "Average Response Time", value: "12.4 Minutes", inline: true },
      { name: "Average Resolution Time", value: "3.8 Hours", inline: true },
      { name: "Tickets by Type", value: "General Support: 31\nBilling: 17" },
      { name: "Tickets by Priority", value: "high: 5\nnormal: 43" },
    ],
  }),
  ticketuserstats: reply(`ticketuserstats ${MEMBER}`, {
    color: OK,
    title: "Ticket Statistics for Biscuit",
    fields: [
      { name: "Total Tickets", value: "3", inline: true },
      { name: "Open Tickets", value: "1", inline: true },
      { name: "Closed Tickets", value: "2", inline: true },
      { name: "Tickets by Type", value: "General Support: 2\nBilling: 1" },
      { name: "Recent Tickets", value: "#48 - Billing - Open\n#31 - General Support - Closed\n#12 - General Support - Closed" },
    ],
  }),

  ticketlistpanels: reply("ticketlistpanels", {
    color: OK,
    title: "Ticket Panels",
    fields: [
      {
        name: `Panel ID: ${PANEL}`,
        value:
          "Channel: #support\n\n**Buttons:**\n• ID: 1 | Label: General Support\n  Category: <#support-tickets>\n  Support Roles: @Staff\n• ID: 2 | Label: Billing\n  Category: <#billing-tickets>\n  Support Roles: @Staff, @Billing\n",
      },
    ],
    footer: "Page 1/1",
  }),
  panellist: reply("panellist", {
    color: OK,
    title: "Ticket Panels",
    fields: [{ name: `Panel ID: ${PANEL}`, value: "Channel: <#support>\nButtons: 2\nSelect Menus: 0" }],
    footer: "Page 1/1",
  }),
  ticketlistpanel: reply(`ticketlistpanel ${PANEL}`, {
    color: OK,
    title: "Panel Components",
    fields: [
      {
        name: "Buttons",
        value:
          "**Button ID: 1**\n└ Label: General Support\n└ Emoji: 🎫\n└ Custom ID: ticket_open_1\n└ Has Questions: Yes\n└ Has Custom Open Message: No\n└ Category: <#support-tickets>\n└ Archive Category: None\n└ Support Roles: @Staff\n",
      },
    ],
  }),
  panelinfo: reply(`panelinfo ${PANEL}`, {
    color: OK,
    title: "Ticket Panel Information",
    description: "Channel: <#support>",
    fields: [
      { name: "Message ID", value: PANEL, inline: true },
      { name: "Buttons", value: "2", inline: true },
      { name: "Select Menus", value: "1", inline: true },
      { name: "Button Details", value: "• General Support (ID: 1)\n• Billing (ID: 2)" },
      { name: "Select Menu 3", value: "Placeholder: Pick a topic\nOptions:\n• Account (account)\n• Other (other)" },
    ],
  }),
  buttoninfo: reply("buttoninfo 1", {
    color: OK,
    title: "Button Information",
    fields: [
      { name: "Label", value: "General Support", inline: true },
      { name: "Emoji", value: "🎫", inline: true },
      { name: "Save Transcripts", value: "True", inline: true },
      { name: "Max Active Tickets", value: "1", inline: true },
      { name: "Auto Close Time", value: "24 hours", inline: true },
      { name: "Required Response Time", value: "30 minutes", inline: true },
      { name: "Ticket Category", value: "Support Tickets", inline: true },
      { name: "Archive Category", value: "Archived Tickets", inline: true },
      { name: "Support Roles", value: "@Staff" },
    ],
  }),
  deletebutton: reply("deletebutton 2", confirm("Successfully deleted button 'Billing'")),
  deleteselectmenu: reply("deleteselectmenu 3", confirm("Successfully deleted select menu 'Pick a topic'")),
  deleteselectoption: reply("deleteselectoption 5", confirm("Successfully deleted option 'Other'")),
  setpaneltranscripts: reply(`setpaneltranscripts ${PANEL} true`, confirm("Transcripts enabled for all buttons in this panel.")),
  setresponsetime: reply("setresponsetime 1 30", confirm("Response time set to 30 minutes")),
  setautoclose: reply("setautoclose 1 24", confirm("Auto-close time set to 24 hours for this button.")),
  setplaceholder: reply("setplaceholder 3 Pick a topic", confirm("Updated placeholder text to: Pick a topic")),
  setmodaltitle: reply("setmodaltitle 1 Support Request", confirm("Modal title set to: Support Request")),
  addmodalfield: reply("addmodalfield 1 Order ID", {
    color: OK,
    title: "Modal Field Added",
    description: "Added field 'Order ID' to the ticket creation modal.",
    fields: [
      { name: "Field ID", value: "order_id", inline: true },
      { name: "Required", value: "True", inline: true },
      { name: "Length Limits", value: "Min: 0, Max: 4000", inline: true },
    ],
  }),
  removemodalfield: reply("removemodalfield 1 order_id", confirm("Removed field 'order_id' from the modal configuration.")),
  listmodalfields: reply("listmodalfields 1", {
    color: OK,
    title: "Modal Fields for General Support",
    fields: [{ name: "order_id", value: "Label: Order ID\nRequired: True\nLength: 0-4000" }],
  }),
  addselectmenu: reply(`addselectmenu ${PANEL}`, {
    color: OK,
    title: "Select Menu Created",
    description: "Successfully created select menu with first option.",
    fields: [
      { name: "Placeholder", value: "Pick a topic" },
      { name: "First Option", value: "Label: Account\nDescription: Login and profile help\nEmoji: 👤" },
      { name: "Note", value: "Use `.addoption 3 <label>` to add more options." },
    ],
  }),
  addoption: reply("addoption 3 Other", {
    color: OK,
    title: "Option Added",
    description: "Successfully added option 'Other' to the select menu.",
    fields: [{ name: "Details", value: "Label: Other\nDescription: None\nEmoji: None" }],
  }),
  listoptions: reply("listoptions 3", {
    color: OK,
    title: "Select Menu Options",
    description: "Placeholder: Pick a topic",
    fields: [
      { name: "Account", value: "Value: account\nDescription: Login and profile help\nEmoji: 👤" },
      { name: "Other", value: "Value: other\nDescription: None\nEmoji: None" },
    ],
  }),
  removeoption: reply("removeoption 3 other", confirm("Removed option 'Other' from the select menu.")),
};

