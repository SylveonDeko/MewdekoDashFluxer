---
title: Role Menus
slug: role-menus
summary: Posts a message that members react to so they can pick their own roles
icon: fa-list-ul
category: Actions
dashboard: /dashboard/roles?tab=menus
module: RoleMenus
tags: [role menus, self roles, reactions, pronouns, colors, temporary roles, role groups, reaction roles]
related: [roles, administration, embedbuilder, rolestates]
---

## What it does

A role menu is one message in a channel with a reaction under it for each option. Each option gives a role. Members react to get the role, so a community can let people choose their pronouns and colors, or their pings and regions, without asking staff.

Each menu has a name that only staff see, a channel and a message, and up to 20 options. An option has a role, the name shown on the menu, an emoji and an optional description. If you do not pick an emoji the bot assigns a number emoji. The message can be anything the embed builder makes: plain text, up to 10 embeds, or both. Leave it empty and the bot posts the menu name with a line for each option.

## The Role menus tab

The **Role menus** tab of the **Roles** page opens on the **Menus** list. The toolbar has **New menu**, **Groups**, **Refresh**, and **Move older setups** when older setups exist. A warning shows when the bot lacks Manage Roles.

Each menu in the list shows its name, a status, and a line with its channel, its mode and its option count. Role chips under it show the options, and a red chip means that option has a problem, such as a deleted role.

| Status | Meaning |
| --- | --- |
| Live | Posted and working |
| Paused | Posted but switched off |
| Not posted | Saved without a message in Fluxer |
| Channel missing | The channel was deleted. Edit the menu, pick a new channel and save. |

Each menu has **Edit**, **Pause** (**Resume** while paused), **Post again**, **Open in Fluxer** and **Delete**. An empty community shows **No role menus yet** with **Create your first menu**.

## Creating a menu

**New menu** opens the editor. **Post menu** creates the menu and posts it. On an existing menu the button reads **Save changes**. Leaving the editor with unsaved edits asks first. The editor ends with a preview of the message.

| Card | Settings |
| --- | --- |
| Basics | **Name** (up to 100 characters) and **Channel**. Only channels the bot can post in are listed. |
| Message | The embed builder. Empty posts the name and the options. |
| Picking | The mode and its limits |
| Who can use it | **Required role**, **Blocked roles** and **Tell members what changed** |
| Timing and groups | **Roles last**, **Menu ends**, **Group**, **New group** and **Message color** |
| Options | Up to 20 options, each with its own settings |

## Picking modes

| Mode | What happens |
| --- | --- |
| Pick any | Reacting gives a role and taking the reaction off removes it. |
| Pick one | Choosing a role swaps out the one they had. |
| Add only | Reacting adds a role. Taking the reaction off keeps it. |
| Remove only | Reacting takes a role away. Roles cannot be added. |
| Reverse | Reacting takes the role. Taking the reaction off gives it back. |

**Pick any** has two limits. **Must keep at least** stops members from dropping below that number once they have picked. **Can hold at most** caps how many they can have from the menu, with **No limit** as the default. Neither can be higher than the number of options.

**Pick one** has **Keep one once chosen**. With it on, members can switch but cannot clear their pick.

## Access

- **Required role**: members without it get a short note saying they need that role, and nothing changes. Default is **Anyone**.
- **Blocked roles**: members with any of these roles cannot use the menu. Up to 25 roles.
- **Tell members what changed**: on by default. The bot posts a line in the menu's channel that mentions the member and lists the roles added and removed, then deletes it after 10 seconds. With it off the menu works quietly, though members still get a note if something goes wrong, such as hitting a limit.

## Timing and groups

- **Roles last**: takes back roles picked from this menu after this long. Empty keeps them. Up to one year. Each option can override it.
- **Menu ends**: a date and time. At that moment the menu's message is deleted and the menu turns off. It must be in the future.
- **Group**: menus in a group share one limit, so picking a role in one can take the role from the others. Pick an existing group, or type a **New group** name to create one. A new group lets members hold one role at a time.
- **Message color**: the color of the default message and its embed.

## Options

Each option row has buttons to move it up or down and to remove it.

| Setting | What it controls |
| --- | --- |
| Role | The role to give. Only roles the bot can give out and that no other option uses are listed. |
| Name on the menu | Up to 80 characters. Fills in with the role name when empty. |
| Emoji | A community emoji or a standard emoji |
| Description | Up to 100 characters. Shown next to the role in the default message. |
| Role lasts | Takes this role back after this long, instead of the menu's **Roles last**. Empty follows the menu. |
| Member limit | How many members can hold the role through this menu. Empty is **No limit**. Picking a full option says it is full. |

Each role can be on a menu only once.

> [!PERMISSION]
> The bot needs Manage Roles, and its highest role must be above every role on the menu. It also needs to see the channel, send messages, embed links, read message history and add reactions there. It cannot give roles that an integration manages.

## Groups

The **Groups** view lists every group with how many menus use it. **Most roles** sets how many roles a member can hold across all the menus in the group, and `0` means no limit. A group can be created here by name and given a limit, or deleted. Deleting a group unlinks its menus. Members keep their roles.

## Editing, pausing and posting again

Saving an edit rebuilds the same message in place. A new message is only posted when the channel changes or the old message is gone.

**Pause** marks the message as paused and stops reactions from changing roles until the menu is resumed. **Post again** posts a fresh copy and deletes the old message, which helps when a menu scrolled out of sight or was deleted by hand.

Deleting a menu deletes its message too. Members keep the roles they already picked.

## Moving older setups

Older emoji role setups had members add an emoji under a message to get a role. **Move older setups** lists them, with the roles and emojis each one holds. For each one choose a channel under **Post in**, and an optional **Name**, then press **Move to a role menu**.

- **Copy the original message** uses the text and embeds of the old message. On by default.
- **Retire the old setup** stops it and clears its emojis. On by default.

A setup where members could hold only one role becomes a **Pick one** menu.

## Commands

Run these with your community's prefix (`.` unless you changed it). Menus are addressed by their number from `rolemenus`. All of them need Manage Roles for you and the bot.

| Command | Aliases | What it does |
| --- | --- | --- |
| `rolemenus` | `rolemenulist`, `rmenus` | Lists every menu with its channel, number of options and status |
| `rolemenuinfo 3` | `rmenuinfo` | Shows everything about one menu |
| `rolemenucreate #roles @Role @Role` | `rmenucreate`, `rolemenunew` | Posts a new menu with one option per role |
| `rolemenuchannel roles [@Role...]` | `rmenuchannel` | Creates a read-only channel for menus and can post a menu in it. Also needs Manage Channels. |
| `rolemenuadd 3 @Role [emoji] [name]` | `rmenuadd` | Adds a role to a menu |
| `rolemenuremove 3 @Role` | `rmenuremove` | Removes a role from a menu |
| `rolemenuname 3 Pronouns` | `rmenuname`, `rolemenurename` | Renames a menu |
| `rolemenumessage 3 [message]` | `rmenumsg`, `rolemenumsg` | Shows or sets the message above a menu |
| `rolemenumode 3 multi\|exclusive\|verify\|removeonly\|reverse` | `rmenumode` | Sets the picking mode. `verify` is Add only. |
| `rolemenulimits 3 0 2` | `rmenulimits` | Sets how many roles members must keep and can hold |
| `rolemenurequire 3 [@Role]` | `rmenurequire` | Sets or clears the required role |
| `rolemenublock 3 @Role...` | `rmenublock` | Sets the blocked roles, or clears them with none |
| `rolemenureply 3 note\|silent` | `rmenureply` | Turns the note on or off |
| `rolemenutemp 3 [time]` | `rmenutemp` | Sets how long picked roles last |
| `rolemenuroletemp 3 @Role [time]` | `rmenuroletemp` | Sets how long one role lasts |
| `rolemenucap 3 @Role [number]` | `rmenucap` | Sets a member limit on one role |
| `rolemenuexpire 3 [time]` | `rmenuexpire` | Makes the menu end after a time |
| `rolemenugroup 3 [name]` | `rmenugroup` | Links a menu to a group, or unlinks it |
| `rolemenugroupmax <number> <name>` | `rmenugroupmax` | Sets a group's limit |
| `rolemenugroupdelete <name>` | `rmenugroupdelete`, `rmenugroupdel` | Deletes a group |
| `rolemenugroups` | `rmenugroups` | Lists the groups |
| `rolemenucolor 3 [color]` | `rmenucolor`, `rolemenucolour` | Sets the message color |
| `rolemenupause 3` | `rmenupause`, `rolemenuresume` | Pauses a menu, or resumes it when paused |
| `rolemenurepost 3 [#channel]` | `rmenurepost` | Posts a fresh copy and deletes the old message |
| `rolemenudelete 3` | `rmenudelete`, `rolemenudel` | Deletes a menu and its message |
| `rolemenuimport messageId` | `rmenuimport` | Moves an older emoji role setup into a new menu |
