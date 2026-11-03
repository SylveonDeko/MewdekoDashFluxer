import { AUTHOR, ERROR, MEMBER, OK, USERNAME, confirm, error, reply, type CommandPreview } from "./chat";

/** `ReplyConfirmAsync`: the OK embed prefixed with the author in bold. */
const said = (text: string) => confirm(`**${USERNAME}** ${text}`);

const permissionPreviews: Record<string, CommandPreview> = {
  verbose: reply("verbose enable", said("I will now show permission warnings.")),
  usrmdl: reply("usrmdl Utility disable Biscuit", said("Disabled usage of `Utility` module for `Biscuit` user.")),
  usrcmd: reply("usrcmd ping enable Biscuit", said("Enabled usage of `ping` command for `Biscuit` user.")),
  srvrmdl: reply("srvrmdl Games disable", said("Disabled usage of `Games` module on this server.")),
  srvrcmd: reply("srvrcmd nuke disable", said("Disabled usage of `nuke` command on this server.")),
  rolemdl: reply("rolemdl Searches enable Moderator", said("Enabled usage of `Searches` module for `Moderator` role.")),
  rolecmd: reply("rolecmd slowmode enable Moderator", said("Enabled usage of `slowmode` command for `Moderator` role.")),
  resetperms: reply("resetperms", said("Permissions for this server are reset.")),
  removeperm: reply("removeperm 3", said("removed permission #3 - `scm ping disable`")),
  permrole: reply("permrole Moderator", said("Users now require **Moderator** role in order to edit permissions.")),
  moveperm: reply("moveperm 3 2", said("Moved permission `cc nuke disable #general` from #3 to #2")),
  listperms: reply("listperms", {
    color: OK,
    title: "**page 1**",
    description:
      "`1.` **allow -> *** [uneditable]\n`2.` **sm Games disable**\n`3.` **rc slowmode enable Moderator**\n`4.` **cm Utility disable #general**",
  }),
  chnlmdl: reply("chnlmdl Games disable #general", said("Disabled usage of `Games` module on channel `general`.")),
  chnlcmd: reply("chnlcmd ping disable #general", said("Disabled usage of `ping` command on channel `general`.")),
  catmdl: reply("catmdl Games disable Text Channels", said("Disabled usage of `Games` module on channel `Text Channels`.")),
  catcmd: reply("catcmd ping disable Text Channels", said("Disabled usage of `ping` command on channel `Text Channels`.")),
  allusrmdls: reply("allusrmdls disable Biscuit", said("Disabled usage of ALL MODULES for user `Biscuit`.")),
  allsrvrmdls: reply("allsrvrmdls enable", said("Enabled usage of ALL MODULES on this server.")),
  allrolemdls: reply("allrolemdls disable Muted", said("Disabled usage of ALL MODULES for role `Muted`.")),
  allchnlmdls: reply("allchnlmdls disable #rules", said("Disabled usage of ALL MODULES on channel `rules`.")),
  allcatmdls: reply("allcatmdls disable Info", said("Disabled usage of ALL MODULES on channel `Info`.")),
  userblacklist: reply("userblacklist add 1521568983961042945 spamming", said("Blacklisted `User` with ID `1521568983961042945`")),
  serverblacklist: reply("serverblacklist add 1521568983961042950 raid server", said("Blacklisted `Server` with ID `1521568983961042950`")),
  channelblacklist: reply("channelblacklist rem 1521568983961042951", said("Unblacklisted `Channel` with ID `1521568983961042951`")),
  manualblacklistcheck: reply("manualblacklistcheck", confirm("Sending manual check...")),
  cmdcooldown: reply("cmdcooldown ping 30s", said("Command **ping** now has a 30s cooldown.")),
  allcmdcooldowns: reply("allcmdcooldowns", "```css\nping: 30sec.                  slowmode: 10sec.\n```"),
  srvrfilterwords: reply("srvrfilterwords", said("Word filtering enabled on this server.")),
  srvrfilterlin: reply("srvrfilterlin", said("Link filtering enabled on this server.")),
  srvrfilterinv: reply("srvrfilterinv", said("Invite filtering enabled on this server.")),
  chnlfilterwords: reply("chnlfilterwords", said("Word filtering enabled on this channel.")),
  chnlfilterlin: reply("chnlfilterlin", said("Link filtering disabled on this channel.")),
  chnlfilterinv: reply("chnlfilterinv", said("Invite filtering enabled on this channel.")),
  lstfilterwords: reply("lstfilterwords", {
    color: OK,
    title: "List of filtered words",
    description: "heck\nfrick\ndarn",
  }),
  invwarn: reply("invwarn yes", confirm("Warn on invite post is now enabled!")),
  fwarn: reply("fwarn yes", confirm("Warn on filtered word is now enabled!")),
  fwclear: reply("fwclear", said("Removed all filtered words and filtered words channel settings.")),
  filterword: reply("filterword heck", said("Added word(s) `heck` to the list of filtered words.")),
  autobanword: reply("autobanword scamlink", confirm("Added `scamlink` to the auto ban words list!")),
  autobanwordlist: reply("autobanwordlist", {
    color: OK,
    title: "Auto Ban Words",
    description: "scamlink\nfreenitro",
  }),
  resetglobalperms: reply("resetglobalperms", said("Global permissions have been reset.")),
  globalpermlist: reply("globalpermlist", {
    color: OK,
    fields: [
      { name: "Blocked Modules", value: "nsfw", inline: false },
      { name: "Blocked Commands", value: "nuke", inline: false },
    ],
  }),
  globalmodule: reply("globalmodule Nsfw", said("Module **Nsfw** has been disabled on all servers.")),
  globalcommand: reply("globalcommand nuke", said("Command **nuke** has been disabled on all servers.")),
};

const OK_EMOTE = "✅";
const LINK = "https://fluxer.app/channels/1521568983961042900/1521568983961042950/1521568983961043001";

const roleStatePreviews: Record<string, CommandPreview> = {
  togglerolestates: reply("togglerolestates", confirm(`${OK_EMOTE} Role States are now enabled!`)),
  togglerolestatesignorebots: reply("togglerolestatesignorebots", confirm(`${OK_EMOTE} Role States will ignore bots!`)),
  togglerolestatesclearonban: reply("togglerolestatesclearonban", confirm(`${OK_EMOTE} Role states will clear on ban!`)),
  togglerolestatesskipautoassign: reply(
    "togglerolestatesskipautoassign",
    confirm(`${OK_EMOTE} Auto-assign roles will be skipped for users with saved role states!`),
  ),
  viewrolestatessettings: reply("viewrolestatessettings", {
    color: OK,
    title: "Role States Settings",
    description:
      "`Enabled:` True\n\n`Clear on ban:` True\n`Ignore bots:` True\n`Skip auto-assign roles:` False\n`Denied roles:` Muted\n`Denied users:` None\n",
  }),
  viewrolestates: reply("viewrolestates", {
    color: OK,
    title: "User Role States",
    fields: [
      { name: "Biscuit (1521568983961042945)", value: "`Saved Roles:` Member|Gamer\n", inline: false },
      { name: "SylveonDeko (1521568983961042944)", value: "`Saved Roles:` Admin|Member\n", inline: false },
    ],
  }),
  saveallrolestates: reply("saveallrolestates", confirm(`${OK_EMOTE} Successfully saved role states for 312 users in the server.`)),
  transferrolestates: reply(
    "transferrolestates 1521568983961042999",
    confirm(`${OK_EMOTE} Successfully transferred 312 role states to The Deko Annex.`),
  ),
  setuserrolestate: reply("setuserrolestate Biscuit Member Gamer", confirm(`${OK_EMOTE} Successfully set role state for ${MEMBER}.`)),
  removerolesfromrolestate: reply(
    "removerolesfromrolestate Biscuit Gamer",
    confirm(`${OK_EMOTE} Successfully removed those roles from Biscuit's Role State!`),
  ),
  addrolestorolestate: reply(
    "addrolestorolestate Biscuit Gamer",
    confirm(`${OK_EMOTE} Successfully removed those roles from Biscuit's Role State!`),
  ),
  deleteuserrolestate: reply("deleteuserrolestate Biscuit", confirm(`${OK_EMOTE} User role state for Biscuit has been deleted!`)),
  rolestatesadddenyrole: reply("rolestatesadddenyrole Muted", confirm(`${OK_EMOTE} 1 roles added to deny list.`)),
  rolestatesremovedenyrole: reply("rolestatesremovedenyrole Muted", confirm(`${OK_EMOTE} Successfully removed 1 role(s) from the deny list.`)),
  rolestatesadddenyuser: reply("rolestatesadddenyuser Biscuit", confirm(`${OK_EMOTE} Successfully added 1 user(s) to the deny list.`)),
  rolestatesremoveadduser: reply(
    "rolestatesremoveadduser Biscuit",
    confirm(`${OK_EMOTE} Successfully removed 1 user(s) from the deny list.`),
  ),
};

const roleMenuPreviews: Record<string, CommandPreview> = {
  rolemenus: reply("rolemenus", {
    color: OK,
    title: "Role menus",
    description:
      "`1` **Pick your roles** in <#roles>: 4 options, live\n`2` **Colour roles** in <#roles>: 6 options, paused",
  }),
  rolemenuinfo: reply("rolemenuinfo 1", {
    color: OK,
    title: "Pick your roles (ID 1)",
    fields: [
      { name: "Channel", value: "<#roles>", inline: true },
      { name: "Picking", value: "pick any", inline: true },
      { name: "Limits", value: "Keep at least 0, hold at most any number", inline: true },
      { name: "Required role", value: "Anyone", inline: true },
      { name: "Confirmation", value: "short note that deletes itself", inline: true },
      { name: "Status", value: "live", inline: true },
      { name: "Options", value: "🎮 Gamer @Gamer\n🎨 Artist @Artist\n🎵 Music @Music\n📚 Reader @Reader", inline: false },
      { name: "Message", value: LINK, inline: false },
    ],
  }),
  rolemenucreate: reply(
    "rolemenucreate #roles Gamer Artist Music",
    confirm(`Role menu **Pick your roles** (ID 1) is live: ${LINK}`),
  ),
  rolemenuadd: reply("rolemenuadd 1 Reader 📚 Reader", confirm("@Reader added to **Pick your roles**.")),
  rolemenuremove: reply("rolemenuremove 1 Reader", confirm("@Reader removed from **Pick your roles**.")),
  rolemenuname: reply("rolemenuname 1 Choose your interests", confirm("Menu renamed to **Choose your interests**.")),
  rolemenumessage: reply("rolemenumessage 1 Pick whatever suits you", confirm("Message for **Pick your roles** updated.")),
  rolemenumode: reply("rolemenumode 1 exclusive", confirm("**Pick your roles** is now pick one.")),
  rolemenulimits: reply("rolemenulimits 1 1 2", confirm("Members using **Pick your roles** must keep at least 1 and can hold at most 2.")),
  rolemenurequire: reply("rolemenurequire 1 Member", confirm("Only members with @Member can use **Pick your roles** now.")),
  rolemenureply: reply("rolemenureply 1 silent", confirm("**Pick your roles** now uses no note.")),
  rolemenupause: reply(
    "rolemenupause 1",
    confirm("Role menu **Pick your roles** is paused. Reactions on it do nothing until you resume it."),
  ),
  rolemenurepost: reply("rolemenurepost 1 #announcements", confirm(`Role menu **Pick your roles** posted again: ${LINK}`)),
  rolemenudelete: reply(
    "rolemenudelete 1",
    confirm("Delete role menu **Pick your roles** and its message in <#roles>? Members keep the roles they already picked."),
    confirm("Role menu **Pick your roles** and its message were deleted. Members keep the roles they already picked."),
  ),
  rolemenuimport: reply(
    "rolemenuimport 1521568983961043001",
    confirm(`Moved that setup to role menu **Pick your roles** (ID 2): ${LINK}`),
  ),
};

const roleGreetPreviews: Record<string, CommandPreview> = {
  rolegreetadd: reply("rolegreetadd Newcomer #welcome", confirm("Added Newcomer to greet in <#welcome>!")),
  rolegreetremove: reply("rolegreetremove 1", confirm("Rolegreet removed!")),
  rolegreetdelete: reply("rolegreetdelete 1 30s", confirm("Successfully updated RoleGreet #1 to delete after 30 seconds")),
  rolegreetgreetbots: reply("rolegreetgreetbots 1 true", confirm("RoleGreet 1 GreetBots set to True")),
  rolegreetdisable: reply("rolegreetdisable 1 false", confirm("RoleGreet 1 set to Disabled")),
  rolegreetwebhook: reply("rolegreetwebhook 1 Welcomer", confirm("Webhook set!")),
  rolegreetmessage: reply("rolegreetmessage 1 Welcome %user.mention%, enjoy your stay!", confirm("RoleGreet Message for RoleGreet #1 set!")),
  rolegreetlist: reply("rolegreetlist", {
    color: OK,
    description:
      "#1\n`Role:` Newcomer `1521568983961042960`\n`Channel:` <#welcome> 1521568983961042951\n`Delete After:` 30s\n`Disabled:` False\n`Webhook:` True\n`Greet Bots:` False\n`Message:` Welcome %user.mention%, enjoy your stay!",
  }),
};

const channelPreviews: Record<string, CommandPreview> = {
  lockdown: reply("lockdown full ban", confirm("Full lockdown has been enabled in The Deko Tree. Action taken: Ban")),
  liftlockdown: reply(
    "liftlockdown full",
    confirm("Full lockdown has been lifted in The Deko Tree. New users can join, and @everyone, along with all channel perms, have been restored."),
  ),
  unlockdown: reply("unlockdown", confirm("Server has been unlocked!")),
  moveto: reply("moveto Lounge", confirm("Successfully moved you to **Lounge**")),
  moveuserto: reply("moveuserto Biscuit Lounge", confirm(`Successfully moved ${MEMBER} to **Lounge**`)),
  grab: reply("grab Biscuit", confirm(`Grabbed ${MEMBER} from Gaming to your VC!`)),
  nuke: reply(
    "nuke",
    error("Are you sure you want to nuke this channel? This will delete the entire channel and remake it."),
  ),
  lock: reply("lock #general", `${OK_EMOTE} Locked down <#general>`),
  unlock: reply("unlock #general", `${OK_EMOTE} Unlocked <#general>`),
  slowmode: reply("slowmode 30s", confirm("Slowmode enabled in <#general> for 30 seconds")),
  createwebhook: reply("createwebhook #general Announcer", `${OK_EMOTE} Created webhook Announcer in <#general>`),
  ccatc: reply("ccatc Community general memes help", confirm("Created category Community with 3 Text Channels!")),
  ccavc: reply("ccavc Hangouts Lounge Gaming", confirm("Created category Hangouts with 2 Voice Channels!")),
  cctc: reply("cctc Community faq rules", confirm("Added 2 Text Channels to Community!")),
  ccvc: reply("ccvc Hangouts Music Study", confirm("Added 2 Voice Channels to Hangouts!")),
  permcontrol: reply(
    "permcontrol #general allow Moderator SendMessages",
    confirm("I have allowed the following permissions for the user Moderator in general: \n**SendMessages**"),
  ),
};

const serverPreviews: Record<string, CommandPreview> = {
  permview: reply("permview", {
    color: OK,
    title: "List of allowed perms",
    description: "**ManageRoles**\n**ManageChannels**\n**ManageMessages**\n**BanMembers**\n**KickMembers**",
  }),
  setsplash: reply("setsplash https://cdn.mewdeko.tech/deko-splash.png", confirm("New splash image has been set.")),
  seticon: reply("seticon https://cdn.mewdeko.tech/deko-icon.png", confirm("New server icon has been set.")),
  setbanner: reply("setbanner https://cdn.mewdeko.tech/deko-banner.png", confirm("New server banner has been set.")),
  setservername: reply("setservername The Deko Tree", confirm("Successfully set server name to The Deko Tree")),
  addemote: reply("addemote partyblob https://cdn.mewdeko.tech/partyblob.png", confirm("🎉 with the name `partyblob` created!")),
  removeemote: reply("removeemote 🎉", confirm("🎉 has been deleted!")),
  renameemote: reply("renameemote 🎉 party", confirm("🎉 has been renamed from `partyblob` to `party`")),
  steal: reply("steal 🎉 🥳", confirm("**Added Emotes**\n🎉 `partyblob`\n🥳 `hypeblob`")),
};

const roleJobBody = (type: string, progress: string) =>
  `Job Type: ${type}\nStarted By: ${AUTHOR}\nProgress: ${progress}\nRole: Gamer`;

const roleCommandPreviews: Record<string, CommandPreview> = {
  createroles: reply(
    "createroles Gamer Artist Music",
    confirm("Are you sure you want to create 3 roles with these names?\nGamer\nArtist\nMusic"),
    confirm(`${OK_EMOTE} Created 3 roles!`),
  ),
  deleteroles: reply(
    "deleteroles Gamer Artist",
    { color: OK, title: "Are you sure you want to delete these roles?", description: "Gamer, 42 Users\nArtist, 17 Users" },
    confirm("Successfully deleted 2 roles!"),
  ),
  syncroletoall: reply(
    "syncroletoall Muted",
    confirm("Succesfully synced perms from Muted to 18 channels and 4 Categories!!"),
  ),
  syncroletoallchannels: reply("syncroletoallchannels Muted", confirm("Succesfully synced perms from Muted to 18 Channels!")),
  syncroletoallcategories: reply("syncroletoallcategories Muted", confirm("Succesfully synced perms from Muted to 4 Categories!")),
  setroles: reply("setroles Biscuit Member Gamer", confirm("Biscuit has been given the roles:\nMember|Gamer")),
  removeroles: reply("removeroles Biscuit Gamer", confirm("Biscuit have had their roles removed:\nGamer")),
  adduserstorole: reply("adduserstorole Gamer Biscuit", confirm("Gamer has had the following users added:\n<@member>")),
  removeusersfromrole: reply("removeusersfromrole Gamer Biscuit", confirm("Gamer has had the following users removed:\n<@member>")),
  rj: reply("rj", {
    color: OK,
    title: "1 Mass Role Operations Running",
    fields: [{ name: "Job 1", value: roleJobBody("Adding to Users and Bots", "120/245"), inline: false }],
  }),
  sj: reply(
    "sj 1",
    {
      color: OK,
      description: "Are you sure you want to stop this job?",
      fields: [{ name: "Adding to Users and Bots", value: `Started by ${AUTHOR}\nProgress: 120/245`, inline: false }],
    },
    {
      color: ERROR,
      description: `Stopping Job 1\nTask: **Adding to Users and Bots**\nProgress: 120/245\nStarted By: ${AUTHOR}`,
    },
  ),
  addtoall: reply(
    "addtoall Gamer",
    confirm("Adding Gamer to 245 members.\nThis will take about 4 minutes."),
    confirm("Applied Gamer to 245 out of 245 members!"),
  ),
  addtoallusers: reply(
    "addtoallusers Gamer",
    confirm("Adding Gamer to 230 members.\nThis will take about 3 minutes."),
    confirm("Applied Gamer to 230 out of 230 users!"),
  ),
  addtoallbots: reply(
    "addtoallbots Bots",
    confirm("Adding Bots to 15 members.\nThis will take about 15 seconds."),
    confirm("Applied Bots to 15 out of 15 bots!"),
  ),
  removefromall: reply(
    "removefromall Gamer",
    confirm("Removing Gamer from 245 members.\nThis will take about 4 minutes."),
    confirm("Removed Gamer from 245 out of 245 members!"),
  ),
  removefromallusers: reply(
    "removefromallusers Gamer",
    confirm("Removing Gamer from 230 members.\nThis will take about 3 minutes."),
    confirm("Removed Gamer from 230 out of 230 users!"),
  ),
  removefromallbots: reply(
    "removefromallbots Bots",
    confirm("Removing Bots from 15 members.\nThis will take about 15 seconds."),
    confirm("Removed Bots from 15 out of 15 bots!"),
  ),
  atuo: reply(
    "atuo 1y Veteran",
    confirm("Adding Veteran to 38 users who have been here for 1 year or longer.\nThis will take about 38 seconds."),
    confirm("Applied Veteran to 38 out of 38 users!"),
  ),
  atuu: reply(
    "atuu 7d Newcomer",
    confirm("Adding Newcomer to 12 users who have been here for less than 1 week.\nThis will take about 12 seconds."),
    confirm("Applied Newcomer to 12 out of 12 users!"),
  ),
  addroletorole: reply(
    "addroletorole Gamer Streamer",
    confirm("Adding Streamer to users in Gamer.\nThis will take about 21 seconds."),
    confirm("Added Streamer to 21 users."),
  ),
  removefromrole: reply(
    "removefromrole Gamer Streamer",
    confirm("Removing Streamer from users in Gamer.\nThis will take about 21s."),
    confirm("Removed Streamer from 21 users."),
  ),
  addthenremove: reply(
    "addthenremove Newcomer Member",
    confirm("Adding Member to users in Newcomer and removing Newcomer.\nThis will take about 1 minute."),
    confirm("Added Member to 30 users and removed Newcomer."),
  ),
  addroletolist: reply(
    "addroletolist Gamer",
    confirm("Adding Gamer to 3 members.\nThis will take about 3 seconds."),
    confirm("Applied Gamer to 3 out of 3 users!"),
  ),
  exportrolelist: reply("exportrolelist", confirm("⏳ Exporting role/user list...")),
  importrolelist: reply(
    "importrolelist",
    confirm("⏳ Importing 120 roles/users\nThis will take about 2 minutes"),
    confirm("Applied 120 role/user imports out of 120!"),
  ),
};

const roleMonitorPreviews: Record<string, CommandPreview> = {
  setdefaultpunishment: reply("setdefaultpunishment Ban", confirm(`${OK_EMOTE} Default punishment action set to Ban.`)),
  addblacklistedrole: reply("addblacklistedrole Admin Ban", confirm(`${OK_EMOTE} Role Admin has been added to the blacklist.`)),
  removeblacklistedrole: reply("removeblacklistedrole Admin", confirm(`${OK_EMOTE} Role Admin has been removed from the blacklist.`)),
  addblacklistedpermission: reply(
    "addblacklistedpermission Administrator",
    confirm(`${OK_EMOTE} Permission Administrator has been added to the blacklist.`),
  ),
  removeblacklistedpermission: reply(
    "removeblacklistedpermission Administrator",
    confirm(`${OK_EMOTE} Permission Administrator has been removed from the blacklist.`),
  ),
  addwhitelisteduser: reply("addwhitelisteduser Biscuit", confirm(`${OK_EMOTE} User Biscuit has been added to the whitelist.`)),
  removewhitelisteduser: reply("removewhitelisteduser Biscuit", confirm(`${OK_EMOTE} User Biscuit has been removed from the whitelist.`)),
  addwhitelistedrole: reply("addwhitelistedrole Moderator", confirm(`${OK_EMOTE} Role Moderator has been added to the whitelist.`)),
  removewhitelistedrole: reply("removewhitelistedrole Moderator", confirm(`${OK_EMOTE} Role Moderator has been removed from the whitelist.`)),
  listblacklists: reply("listblacklists", {
    color: "#e74c3c",
    title: "Blacklisted and Whitelisted Roles and Permissions",
    fields: [
      { name: "Blacklisted Roles", value: "Admin - Punishment: Ban", inline: false },
      { name: "Blacklisted Permissions", value: "Administrator - Punishment: Default", inline: false },
      { name: "Whitelisted Roles", value: "Moderator", inline: false },
      { name: "Whitelisted Users", value: "Biscuit", inline: false },
    ],
  }),
};

export const servermanagementPreviews: Record<string, CommandPreview> = {
  ...permissionPreviews,
  ...roleStatePreviews,
  ...roleMenuPreviews,
  ...roleGreetPreviews,
  ...channelPreviews,
  ...serverPreviews,
  ...roleCommandPreviews,
  ...roleMonitorPreviews,
};
