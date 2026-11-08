---
title: Tickets
slug: tickets
summary: Support ticket panels that open private channels for your staff to handle
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, reactions]
related: [administration, chat-triggers, auditlog]
---

## What it does

Tickets turns a channel into a help desk. You post a panel, which is a message with an embed and one reaction per ticket type. When a member reacts, the bot removes their reaction and creates a private text channel for them that only they and your support roles can see. It then posts an opening message with a claim reaction and a close reaction.

From the member's side: react, and a channel named like `ticket-username-1` appears. They describe their issue there. When it is closed the channel is renamed to `closed-...`, locked, and either moved to an archive category or deleted after a delay, depending on how you set that ticket type up.

From staff's side: claim a ticket so everyone knows who is handling it, set a priority and add tags, leave notes, link related tickets into a case, and close it. Every close can save a transcript to a channel and to the dashboard. The dashboard also shows response and resolution times, tickets by priority, and a per-staff view.

Each ticket type has its own category, roles, limits, opening message and close behaviour.

## Why you would use it

- A support community wants private one-on-one channels instead of a public help channel.
- You have several teams, such as billing and moderation, and want one panel that routes to the right one.
- You want applications or partnership requests kept separate from general support.
- You want an audit trail: transcripts, staff notes and cases that group related reports.
- You want to stop specific members from opening tickets at all.

## Panels and ticket types

A panel is one message in one channel. The panel ID is that message's ID. Fluxer has no buttons, select menus or pop-up forms, so panels work by reactions only. Each ticket type on the panel has a label (max 80 characters) and an emoji, and members react with that emoji to open a ticket. Some commands still call a ticket type a button.

The bot adds an embed under your panel embed that lists every reaction with its label. If a ticket type has no emoji, or two share one, the bot assigns numbered emoji instead.

A panel holds at most 20 ticket types. Any beyond that get no reaction.

If the panel message is deleted, `checkpanels` lists which panels are missing and `recreatepanel` or `recreateallpanels` posts them again and updates the stored message ID. Changing a ticket type rewrites the panel message and its reactions to match.

`ticketduplicatepanel` copies a panel and every ticket type to another channel. `ticketmovepanel` moves it. `ticketupdatepanel` replaces the embed with new embed JSON.

### Panels on the dashboard

The **Panels** card lists each panel with its channel and its number of ticket types. A badge shows "Message missing" or "Channel is gone" when the panel's message or channel no longer exists, and **Post missing panels again** reposts every panel whose message is missing. **New panel** asks for a channel and creates the panel. Each row has a menu with **Edit**, **Repost** and **Delete**. Deleting a panel with open tickets asks again before **Delete anyway**.

Editing a panel opens a sheet with:

- **Message**: the panel embed, built in the message editor with a preview.
- **Ticket types**: the list of ticket types with a "Ticket type label" field and **Add ticket type**.
- **Move, copy and delete**: **Move to channel** with **Move**, **Copy to channel** with **Duplicate**, **Repost** and **Delete panel**.

Opening a ticket type shows the settings below. They save as you change them.

### Ticket type settings

Besides **Label** and **Emoji**, they are grouped into collapsible sections that show how many values are set.

| Section | Setting | Default | What it controls |
| --- | --- | --- | --- |
| Channels | Channel name format | `ticket-{username}-{id}` | Name of the created channel; `{id}` is the member's ticket number, max 90 characters |
| Channels | Ticket category | none | Category the channel is created in |
| Channels | Archive category | none | Category the channel moves to when closed or archived |
| Channels | Claimed category | none | Category the channel moves to when a staff member claims it |
| Channels | Thread channel | none | Open the ticket as a private thread in a text channel, or as a post in a forum, instead of a new channel. Anyone who can see the forum can see its posts |
| Access and limits | Support roles | none | Roles that can see, talk in and claim the ticket |
| Access and limits | Viewer roles | none | Roles that can read but not send |
| Access and limits | Max open tickets per member | 1 | How many open tickets of this type one member may have, 1 to 100 |
| Access and limits | Allowed priorities | any | Which priorities staff may set on this type. Only shown once priorities exist |
| Access and limits | Default priority | none | Priority a new ticket starts with |
| Timing | Auto close after (hours) | none | Stored per type, 0 to 8760, and shown in `buttoninfo` |
| Timing | Reply within (minutes) | none | Stored per type, 0 to 10080, and shown in `buttoninfo` |
| Closing | Save a transcript | off | Generate a transcript when the ticket closes |
| Closing | DM the transcript to the creator | off | Send that transcript to the member who opened the ticket |
| Closing | Archive automatically on close | off | Archive the ticket as part of closing it |
| Closing | Delete on close | off | Delete the channel after the delay instead of keeping it |
| Closing | Delete delay (minutes) | 5 | Wait before deletion when Delete on close is on, 0 to 10080 |
| Closing, When closed | Lock the channel | on | Deny sending for everyone except support roles |
| Closing, When closed | Rename the channel | on | Prefix the channel name with `closed-` |
| Closing, When closed | Remove the creator | on | Remove the opener's access when closed |
| Closing, When archived | Lock the channel | on | Make the channel read-only when archived |
| Closing, When archived | Rename the channel | on | Prefix the channel name with `archived-` |
| Closing, When archived | Remove the creator | off | Remove the opener's access when archived |
| Open message | Message | default embed | Custom opening message with placeholders |

### The opening message

By default the bot posts an embed titled "Support Ticket" that welcomes the member and shows the ticket ID and creation time. It asks them to describe the issue. The bot adds a claim reaction (🤝) and a close reaction (🔒) to it.

You can replace it per ticket type with your own text or embed. Use the message editor in the **Open message** section of a ticket type. Placeholders available here:

| Placeholder | Value |
| --- | --- |
| `%ticket.id%` | The ticket number |
| `%ticket.channel%` | Mention of the ticket channel |
| `%ticket.user%` | The opener's username |
| `%ticket.user.mention%` | A mention of the opener |
| `%ticket.user.avatar%` | The opener's avatar URL |
| `%ticket.user.id%` | The opener's user ID |
| `%ticket.created%` | When the ticket was created |

The editor also offers `%server%` and `%server.members%` next to these. The rest of the general placeholder set is not applied to this message.

## What happens when a ticket opens

1. A member reacts on the panel. The bot removes the reaction so it can be used again.
2. Blacklisted members are refused with a DM.
3. The member's open tickets of this type are counted against **Max open tickets per member** (default 1).
4. The channel is created in the ticket category with `@everyone` denied, the opener allowed to view, send, read history, attach files and embed links, support roles given the same plus Manage Messages, and viewer roles allowed to read only.
5. The opening message is posted with the claim and close reactions.
6. If a **Thread channel** is set for the type, a private thread or forum post is created there instead, and step 4 does not apply.
7. If a log channel is set, a "new ticket" entry is posted there.
8. If **Ping roles when a ticket opens** is on, the support roles and the roles to ping are mentioned in the ticket. If **DM the creator on claim and unclaim** is on, members of those roles also get a DM about the new ticket.
9. A **Ticket opened** event is published to chat triggers.

If the bot cannot open the ticket, the member gets the reason by DM.

## Claiming, notes, priorities and tags

**Claim**: a support role member or an administrator claims the ticket by reacting with 🤝 on the opening message or with `ticketclaim`. The channel gets a "claimed by" embed. Only the claimer or an administrator can unclaim. A closed or already claimed ticket cannot be claimed.

**Notes**: `ticketnote` adds a staff note to the current ticket. The note is stored with the ticket and shown on the dashboard. It is also posted in the ticket channel as a blue "note added" embed with the author in the footer.

**Priorities** are community-wide definitions created with `ticketaddpriority` or in the **Priorities** card. **New priority** takes a **Name** (max 40 characters), a **Short name** (letters, numbers, `-` and `_`, max 32), an **Emoji**, a **Color**, a **Level** from 1 to 5, **Reply within (minutes)** from 1 to 10080 (5 by default) and **Ping staff when set**. Setting a priority on a ticket posts an embed in that colour and, when the flag is on, pings the support roles. A ticket type can restrict which priorities are allowed. Rows show the level, "Pings staff" and the reply time, and can be deleted.

**Tags** are community-wide labels. The **Tags** card has **New tag** with a **Name** (max 40 characters), a **Short name** (max 32), a **Description** (max 100 characters) and a **Color**. Add or remove them on a ticket with `ticketaddtags` and `ticketremovetags` using the short names, or from the ticket's sheet on the dashboard. Tickets can be searched by tag.

## Closing, archiving and transcripts

Closing marks the ticket closed and posts a red "ticket closed" embed. Staff close a ticket with the 🔒 reaction on the opening message or with `ticketclose`. Then, in order:

1. If **Save a transcript** is on for the type and a transcript channel is set, the last 5000 messages are saved and an embed with a **View Transcript** link is posted in the transcript channel. The link opens the transcript on the dashboard.
2. If auto-archive is on for the type, or you closed with `ticketclose true`, the ticket is archived (see below).
3. Otherwise the close behaviours run: rename to `closed-...`, remove the opener, lock the channel while keeping support roles, then either move to the archive category or, with **Delete on close**, warn in the channel and schedule deletion after the delete delay. Scheduled deletions are processed once a minute.

Archiving renames the channel to `archived-...`, moves it to the archive category, makes it read-only for everyone, and marks the ticket archived. `ticketarchive` does this directly on an open ticket. If the channel is gone the ticket is simply marked archived. Tickets in threads are locked and archived in place and are not moved between categories.

Closing publishes a **Ticket closed** event to chat triggers.

> [!NOTE]
> A transcript is only produced when both the type has **Save a transcript** enabled and the community has a transcript channel. Without a transcript channel the close still succeeds but nothing is saved.

## Cases

A case groups tickets that belong together, for example several reports about the same person. Create one with `ticketcreatecase <title> <description>` or with **New case** in the **Cases** card (title max 100 characters, description max 1000), then link the current ticket with `ticketlinkcase <caseId>` and unlink with `ticketunlinkcase`. Each case row shows its ID, ticket count, Open or Closed state and date.

Opening a case shows its title and description, which save as you type, and its **Linked tickets**. Pick tickets under **Link tickets** and press **Link selected**, or unlink one from its menu. Cases have their own **Notes**, can be closed and reopened. When closing a case, **Archive linked tickets** archives its tickets as well.

The same case tools exist as commands: `ticketviewcase [caseId]`, `ticketnotecase`, `ticketclosecase`, `ticketreopencase`, `ticketupdatecase`, `ticketlinktickets` and `ticketunlinktickets`, listed below.

## Blacklist

`ticketblock @user [reason]` stops a member from opening tickets. The reason is written to the log channel if one is set. `ticketunblock` lifts it. The **Blocked members** card has a **User ID** field, an optional reason (max 200 characters) and **Block**. Each blocked member has an **Unblock** action in their row menu.

## Bulk tools

The **Batch actions** card holds four collapsible actions, each confirmed before it runs. The result reads "Updated N tickets", or how many were done and how many failed.

| Action | Fields | What it does |
| --- | --- | --- |
| Close inactive tickets | **Inactive for (hours)**, 1 to 8760, default 48 | Same as `ticketcloseinactive <hours>`. Closes every open ticket with no activity for that long, posting an "auto closed" embed in each and archiving it if the type has an archive category |
| Move tickets between categories | **From category**, **To category** | Same as `ticketmoveall`. Moves every ticket channel between categories |
| Add a role to open tickets | **Role**, **View only, no sending** | Adds the role to every open ticket, optionally read-only |
| Transfer claimed tickets | **From staff member ID**, **To staff member ID** | Moves every open ticket claimed by the first person to the second |

## Statistics

`ticketstats` shows totals, open and closed counts, average response time in minutes, average resolution time in hours, and breakdowns by type and priority. `ticketuserstats [@user]` shows the same for one member plus their recent tickets. The **Overview** card at the top of the page shows **Total**, **Open**, **Closed**, **Avg response** and **Avg resolution** for the last 30 days, a **Last 14 days** activity chart, **By priority** counts and **Staff response time**.

## Settings

The Tickets page is a single page of cards, in this order: **Overview**, **Panels**, **Tickets**, **Cases**, **Priorities**, **Tags**, **Settings**, **Blocked members** and **Batch actions**.

The **Settings** card holds the community-wide options:

| Setting | Default | What it controls |
| --- | --- | --- |
| Transcript channel | none | Where transcript summaries with links are posted |
| Log channel | none | Where ticket creation and blacklist entries are logged |
| DM every transcript to the ticket creator | off | Sends the creator a copy of every transcript |
| DM the creator on claim and unclaim | off | Notifies the creator when staff claim or release the ticket. Also DMs support role members when a ticket opens |
| Ping roles when a ticket opens | off | Mentions the support roles and the roles below in each new ticket |
| Roles to ping | none | Extra roles mentioned when a ticket opens. Shown once pings are on |

Everything else is set per panel and ticket type, as described above. The **Tickets** card lists tickets with search ("Ticket, member, channel or tag"), a status filter (Open, Closed, Archived, All) and a priority filter, 40 at a time with **Show more**. Opening a ticket shows who opened it, when, who claimed it and last activity. From the ticket's sheet staff can claim or unclaim, set the **Priority**, link or unlink a **Case**, add **Tags**, add, edit and delete **Notes** (max 1000 characters), close with or without archiving, and open the transcript.

> [!PERMISSION]
> The bot needs Manage Channels and Manage Roles so it can create ticket channels and set who can see them. It also needs Add Reactions and Manage Messages in the panel channel, to add the panel reactions and clear them after use. Its role must be able to view the ticket and archive categories.

## Setup walkthrough

1. Create a category for open tickets and, optionally, one for closed ones. Create a transcript channel and a log channel that only staff can see.
2. Open **Tickets** in the dashboard and set **Transcript channel** and **Log channel** in the **Settings** card.
3. In the **Priorities** card press **New priority** and create at least one (for example `urgent`, level 5, **Ping staff when set** on). Add any tags in the **Tags** card.
4. In the **Panels** card press **New panel** and choose the channel. The panel opens for editing. Design the **Message**.
5. Under **Ticket types**, type a label and press **Add ticket type**, then open it. Set the emoji members react with, the **Ticket category**, **Archive category** and **Support roles**, and turn on **Save a transcript**. Decide between keeping closed channels in the archive category or **Delete on close** with a delay.
6. Optionally set an **Open message** on the same ticket type.
7. Repeat for each further ticket type, with its own emoji and settings.
8. Open a test ticket from another account by reacting on the panel, claim it, set a priority, close it, and check the transcript channel.

## Commands

Run these with your community's prefix (`.` unless you changed it). Panel IDs are message IDs; ticket type IDs (the button IDs in commands) come from `panelinfo` or `ticketlistpanel`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrator | Create a panel, with a preview or create prompt answered by reaction |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrator | Delete a panel; `true` forces it even with tickets attached |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrator | Replace the panel embed |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrator | Move a panel to another channel |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrator | Copy a panel and its ticket types |
| `panellist` | `plist` | Administrator | List panels with component counts |
| `panelinfo <panelId>` | `pinfo` | Administrator | Show a panel's ticket types with IDs |
| `ticketlistpanels` | `tlistpanels` | Manage Channels | Detailed paginated list of every panel |
| `ticketlistpanel <panelId>` | `tlistpanel` | Manage Channels | Every ticket type of one panel with settings |
| `checkpanels` | `tcheckpanels` | Administrator | Report panels whose message or channel is missing |
| `recreatepanel <panelId>` | `trecreate` | Administrator | Repost a missing panel |
| `recreateallpanels` | `trecreateall` | Administrator | Repost every missing panel |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrator | Toggle transcripts for every ticket type on a panel |
| `ticketaddbutton <panelId> <label> [emoji]` | `taddbtn` | Administrator | Add a ticket type |
| `buttoninfo <buttonId>` | `binfo` | Administrator | Show a button's settings |
| `deletebutton <buttonId>` | `delbtn` | Administrator | Remove a button |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrator | Set or clear the ticket category |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrator | Set or clear the archive category |
| `ticketthreadchannel <buttonId> [channel]` | `tthreadchannel`, `ticketthreads` | Administrator | Open this ticket type as threads or forum posts in a channel |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrator | Archive automatically on close |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrator | Set several close behaviours at once |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrator | Set or clear the auto close hours |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrator | Same as above |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrator | Set or clear the required response time |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrator | Same as above |
| `ticketclaim` | `tclaim` | Nobody | Claim the current ticket (support role or administrator) |
| `ticketunclaim` | `tunclaim` | Nobody | Release your claim (claimer or administrator) |
| `ticketclose [archive]` | `tclose` | Nobody | Close the current ticket; `true` also archives |
| `ticketarchive` | `tarchive` | Manage Channels | Archive the current ticket |
| `ticketnote <text>` | `tnote` | Nobody | Add a staff note |
| `ticketpriority <priorityId>` | `tpriority` | Nobody | Set the current ticket's priority |
| `ticketaddtags <tagId...>` | `taddtags` | Nobody | Add tags to the current ticket |
| `ticketremovetags <tagId...>` | `tremovetags` | Nobody | Remove tags from the current ticket |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrator | Define a priority, for example `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrator | Delete a priority definition |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrator | Define a tag |
| `ticketremovetag <id>` | `tremovetag` | Administrator | Delete a tag definition |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Manage Messages | Create a case |
| `ticketlinkcase <caseId>` | `tlinkcase` | Manage Messages | Link the current ticket to a case |
| `ticketunlinkcase` | `tunlinkcase` | Manage Messages | Unlink the current ticket |
| `ticketviewcase [caseId]` | `tviewcase` | Manage Messages | List cases, or show one |
| `ticketnotecase <caseId> <text>` | `tnotecase` | Manage Messages | Add a note to a case |
| `ticketclosecase <caseId>` | `tclosecase` | Manage Messages | Close a case |
| `ticketreopencase <caseId>` | `treopencase` | Manage Messages | Reopen a case |
| `ticketupdatecase <caseId> <title> <description>` | `tupdatecase` | Manage Messages | Change a case's title and description |
| `ticketlinktickets <caseId> <ticketIds...>` | `tlinktickets` | Manage Messages | Link tickets to a case |
| `ticketunlinktickets <caseId> <ticketIds...>` | `tunlinktickets` | Manage Messages | Unlink tickets from a case |
| `ticketblock @user [reason]` | `tblock` | Administrator | Blacklist a member |
| `ticketunblock @user` | `tunblock` | Administrator | Remove from the blacklist |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrator | Set or clear the transcript channel |
| `ticketlogchannel [#channel]` | `tlogch` | Administrator | Set or clear the log channel |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrator | Close tickets idle for that long |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrator | Move all tickets between categories |
| `ticketstats` | `tstats` | Nobody | Community ticket statistics |
| `ticketuserstats [@user]` | `tuserstats` | Nobody | A member's ticket statistics |

## Tips and gotchas

- Commands that act on "the current ticket" only work inside a ticket channel. Run them in the ticket, not in a staff channel.
- Every ticket type needs support roles, or nobody but administrators can claim and nobody except the opener can talk once the channel is locked.
- The default limit is one open ticket per member per type. Raise **Max open tickets per member** for types where repeat tickets are normal.
- **Auto close after (hours)** and **Reply within (minutes)** are saved on the type and shown in `buttoninfo`, but the only thing in the bot that closes idle tickets is `ticketcloseinactive` or the **Close inactive tickets** batch action. Run that on a schedule yourself if you want automatic cleanup.
- **Delete on close** and **Lock the channel** under **When closed** interact: a ticket set to delete is not locked first, it just waits out the delete delay.
- Panel embed JSON must be valid embed builder output. Use the dashboard editor and copy the JSON if you prefer commands.
- Deleting a panel with open tickets is refused unless you pass `true`, which clears the tickets' link to the panel.
- Transcripts capture at most 5000 messages, and the "View Transcript" link opens the transcript on the dashboard.
- Members need to be able to DM the bot to see why a ticket failed to open.
