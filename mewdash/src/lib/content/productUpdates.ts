export type ProductUpdate = {
  id: string;
  label: string;
  title: string;
  summary: string;
  href: string;
  action: string;
};

// Keep the newest public update first. The landing page intentionally features one item at a time.
export const productUpdates: ProductUpdate[] = [
  {
    id: "global-list",
    label: "New page",
    title: "A shared list of harmful users",
    summary: "Communities that opt in report harmful users and act on the entries that pass review.",
    href: "/dashboard/globallist",
    action: "Set it up"
  },
  {
    id: "ticket-setup",
    label: "New setting",
    title: "Quick ticket setup",
    summary: "Choose a channel and your ticket types, and the bot posts the panel.",
    href: "/dashboard/tickets",
    action: "Set up tickets"
  },
  {
    id: "welcome-cards",
    label: "New setting",
    title: "Cards on welcome messages",
    summary: "Each welcome or goodbye message can have its own card, shown in the embed or attached.",
    href: "/dashboard/multigreets",
    action: "Add a card"
  },
  {
    id: "card-designs",
    label: "New feature",
    title: "Card designs members can wear",
    summary: "Sell rank and achievement card designs in the shop, or let members make their own.",
    href: "/dashboard/currency?tab=designs",
    action: "Open designs"
  },
  {
    id: "currency-setup",
    label: "New setting",
    title: "Guided currency setup",
    summary: "A short setup picks your coin emoji and daily reward.",
    href: "/dashboard/currency?tab=setup",
    action: "Start the setup"
  },
  {
    id: "xp-categories",
    label: "New setting",
    title: "XP multipliers for whole categories",
    summary: "Boost or reduce XP across every channel in a category at once.",
    href: "/dashboard/xp",
    action: "Set a multiplier"
  },
  {
    id: "voice-text-channels",
    label: "New setting",
    title: "Text chats for custom voice channels",
    summary: "Each temporary voice channel can come with its own text channel.",
    href: "/dashboard/customvoice",
    action: "Turn it on"
  },
  {
    id: "fluxerlist-votes",
    label: "New page",
    title: "Reward votes on FluxerList",
    summary: "Thank members who vote for your community on FluxerList.",
    href: "/dashboard/votes",
    action: "Set up votes"
  },
  {
    id: "new-member-role",
    label: "New setting",
    title: "Mark new members with a role icon",
    summary: "New members get a role with an icon for their first days.",
    href: "/dashboard/roles?tab=stats",
    action: "Add the role"
  },
  {
    id: "bridges",
    label: "New page",
    title: "Bridge channels with Discord",
    summary: "Messages relay between a channel here and a Discord channel.",
    href: "/dashboard/bridges",
    action: "Bridge a channel"
  },
  {
    id: "join-role-timeout",
    label: "New setting",
    title: "Remove members who never verify",
    summary: "Kick members who still lack a verified role after a set time.",
    href: "/dashboard/administration",
    action: "Set it up"
  },
  {
    id: "nine-tailed-cat",
    label: "New look",
    title: "Meet the nine-tailed cat",
    summary: "Mewdeko has a mascot now, with a tool on every tail.",
    href: "/",
    action: "See the home page"
  },
  {
    id: "achievements",
    label: "New page",
    title: "Achievements for everything your members do",
    summary: "Members unlock achievements and wear them as badges.",
    href: "/dashboard/achievements",
    action: "Set up achievements"
  },
  {
    id: "activity-stats",
    label: "New page",
    title: "Activity stats for the whole community",
    summary: "Messages, voice time, games and growth over up to ninety days.",
    href: "/dashboard/serverstats",
    action: "Open activity stats"
  },
  {
    id: "stat-roles",
    label: "New page",
    title: "Roles that follow activity",
    summary: "Roles earned by recent activity and removed when it stops.",
    href: "/dashboard/roles?tab=stats",
    action: "Create a stat role"
  },
  {
    id: "invite-tracking-overhaul",
    label: "New in invites",
    title: "Invite tracking, rebuilt",
    summary: "Every join is tied to an invite, and you can see who stays.",
    href: "/dashboard/invites",
    action: "Open invites"
  },
  {
    id: "live-boards",
    label: "New page",
    title: "Boards that keep themselves current",
    summary: "Pin a leaderboard or chart and the bot keeps it updated.",
    href: "/dashboard/liveboards",
    action: "Add a live board"
  },
  {
    id: "wiki",
    label: "New everywhere",
    title: "A wiki for every feature",
    summary: "Every feature has a guide, and each page opens its own.",
    href: "/wiki",
    action: "Browse the wiki"
  },
  {
    id: "utilities-page",
    label: "New page",
    title: "Utilities, all in one place",
    summary: "Command-only features now share one page.",
    href: "/dashboard/utility",
    action: "Open utilities"
  },
  {
    id: "polls-page",
    label: "New page",
    title: "Polls from the dashboard",
    summary: "Create and schedule polls without a command.",
    href: "/dashboard/polls",
    action: "Open polls"
  },
  {
    id: "message-filters-page",
    label: "New page",
    title: "Message filters",
    summary: "Message filters have their own page now.",
    href: "/dashboard/automod?tab=filters",
    action: "Open message filters"
  },
  {
    id: "moderation-warnings",
    label: "New in moderation",
    title: "Warnings and the punishment ladder",
    summary: "Warn members and set what happens at each warning count.",
    href: "/dashboard/moderation?tab=punishments",
    action: "Set up punishments"
  },
  {
    id: "tickets-tab",
    label: "New in tickets",
    title: "Work tickets from the dashboard",
    summary: "Browse and act on every ticket.",
    href: "/dashboard/tickets?tab=tickets",
    action: "Open tickets"
  },
  {
    id: "forms-builder",
    label: "New in forms",
    title: "A cleaner form builder",
    summary: "Creating and editing a form now work the same way.",
    href: "/dashboard/forms",
    action: "Open forms"
  },
  {
    id: "command-permissions",
    label: "New in administration",
    title: "Command permissions you can read",
    summary: "Permission rules use pickers and read as sentences.",
    href: "/dashboard/administration?tab=automation",
    action: "Open permissions"
  },
  {
    id: "counting-management",
    label: "New in counting",
    title: "Counting channel management",
    summary: "Manage counting channels from the dashboard.",
    href: "/dashboard/counting?tab=management",
    action: "Open counting"
  },
  {
    id: "dashboard-quality-of-life",
    label: "Across the dashboard",
    title: "Smaller things you asked for",
    summary: "Additions to pages that already existed.",
    href: "/dashboard/music",
    action: "Open the player"
  },
  {
    id: "chat-triggers-conditions",
    label: "New in chat triggers",
    title: "Triggers that know when to stay quiet",
    summary: "Triggers check conditions first and tell you why they didn't fire.",
    href: "/dashboard/chat-triggers",
    action: "Open chat triggers"
  },
  {
    id: "stat-channel-counters",
    label: "New in stat channels",
    title: "Counters that keep up",
    summary: "Nearly sixty counters, updating as often as every minute.",
    href: "/dashboard/statchannels",
    action: "Open stat channels"
  },
  {
    id: "ban-purge",
    label: "New in moderation",
    title: "Ban purge rules",
    summary: "Set once how much history a ban clears.",
    href: "/dashboard/moderation?tab=banpurge",
    action: "Set up ban purge"
  },
  {
    id: "channel-access",
    label: "New in community setup",
    title: "Vote people into locked channels",
    summary: "Members apply to a locked channel and the people inside vote.",
    href: "/dashboard/channel-access",
    action: "Set up channel access"
  },
  {
    id: "currency-economy",
    label: "New in currency",
    title: "A real economy",
    summary: "Currency has a shop and more ways to earn.",
    href: "/dashboard/currency",
    action: "Open economy settings"
  },
  {
    id: "music-link-conversion",
    label: "New in music",
    title: "Music link conversion",
    summary: "Post a music link and get it on every other platform.",
    href: "/dashboard/music",
    action: "Set up music links"
  },
  {
    id: "image-hash-bans",
    label: "New in protection",
    title: "Image hash bans",
    summary: "Block known scam images before they spread.",
    href: "/dashboard/administration?tab=protection",
    action: "Open protection settings"
  }
];

export const latestProductUpdate = productUpdates[0];

/** Key the id of the newest update a viewer has acknowledged is stored under. */
export const lastSeenUpdateKey = "product-updates:last-seen";

/**
 * The updates published since the one a viewer last acknowledged, newest first.
 *
 * A viewer who has never acknowledged anything sees nothing: someone opening the dashboard for
 * the first time should not be met with the entire changelog. The layout records the newest id
 * for them instead, so they start receiving updates from their next visit onwards.
 */
export function unseenProductUpdates(lastSeenId: string | null): ProductUpdate[] {
  if (!lastSeenId) return [];

  const index = productUpdates.findIndex((update) => update.id === lastSeenId);

  // An unknown id means the stored update was removed, so treat only the newest as unseen
  // rather than replaying everything.
  if (index === -1) return productUpdates.slice(0, 1);

  return productUpdates.slice(0, index);
}
