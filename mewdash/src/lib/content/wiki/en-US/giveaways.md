---
title: Giveaways
slug: giveaways
summary: Run timed giveaways that members enter by reacting, with entry requirements and automatic prizes
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, reaction]
related: [embedbuilder, chat-triggers, xp]
---

## What it does

Staff start a giveaway with a prize, a channel, a number of winners and a duration. The bot posts an embed in that channel showing the prize, the host, when it ends and any requirements. Members enter by reacting with the giveaway emote.

When the timer runs out the bot picks winners at random from everyone who entered and still meets the requirements. It edits the original message to show the winners and posts a congratulations message in the channel. If enabled, it also DMs each winner with a link to the giveaway. Staff can end a giveaway early or reroll it after it has ended.

A giveaway can also give members with certain roles extra entries and pay winners XP or coins automatically. It can be saved as a draft and started later.

Requirements are checked at the end, not at entry. Someone who reacted but later lost a required role is skipped when winners are chosen.

## Why you would use it

- Give away game keys or merch to active members without picking names by hand.
- Reward people who have actually been talking by requiring a minimum message count, or restrict a prize to a supporter role.

## Entering

Members enter by reacting to the giveaway message with the giveaway emote. The bot reads the reaction list when the giveaway ends.

The giveaway emote is set per community with `gemote`. The bot validates it by reacting with it, so a custom emote from another community only works if the bot is also in that community. The bot needs Add Reactions in the channel, and `gstart` refuses to start without it.

## Requirements

| Requirement | Set by | Effect at draw time |
| --- | --- | --- |
| Required roles | `gstart` wizard, dashboard **Required roles** | The member must hold all of the listed roles |
| Message count | `gstart` wizard, dashboard **Messages required** | The member's counted messages in this community must be at least this number. Uses the message count service, so it only knows about messages counted since that was enabled. |

Bots are always excluded, and so is anyone who has left the community. Requirements are listed in the giveaway embed as a **Required Roles** line and a "N Messages Required" line.

## The giveaway message

The embed's title is the prize. The description reads "React with (emote) to enter!" and names the host. It also shows the end time as a relative and absolute timestamp. The footer shows the winner count and the community name, and the end date appears there too. Message content is the ping role mention if one is set.

If a giveaway has extra entries, the embed also lists each role with its bonus.

Community-wide defaults, set in the **Defaults** card on the dashboard or with commands:

| Dashboard setting | Command | Effect |
| --- | --- | --- |
| Emoji | `gemote` | Default entry emote for new giveaways |
| Ping role | none | Role mentioned in the message of each giveaway. Choose **No ping role** to clear it. |
| Banner image URL | `gbanner` | Image shown on every giveaway. Must be an `http` or `https` link. The `gstart` wizard can override it per giveaway. |
| Message color | `gembedcolor` | Colour of the giveaway embed. Pick a colour or type a six digit hex code such as `#5865f2`. |
| Winner message switch | `gdm` | Whether winners get a DM. On by default. |

### When it ends

Winners are picked at random without repeats. A member's chance is weighted by their entries: one for entering, plus the bonus of every extra-entry role they hold. If there is an automatic prize, each winner is paid and the bot posts a message in the channel saying so. Rerolls do not pay the prize again.

If enough eligible entrants exist, the bot edits the embed to "Winner: @user" with the host, sets the footer to "Ended at (time)", changes the content to "**Giveaway Ended!**", and posts a separate congratulations message linking the giveaway and showing the reroll command. If nobody entered, or fewer eligible people entered than there are winners, the embed is replaced with "There were not enough participants!" and the giveaway is marked ended. If people entered but none met the requirements, it says so instead.

A single-winner giveaway also fires the `GiveawayWon` event for chat triggers, so a trigger can react to a win.

### Winner DM

With the **Winner message** card switched on, each winner gets a DM. The default is an embed saying they won, with a link to the giveaway message. If a custom end message is stored, it is sent instead and can use these placeholders on top of the general placeholders.

| Placeholder | Value |
| --- | --- |
| `%messagelink%` | Link to the giveaway message |
| `%giveawayitem%` | The prize |
| `%giveawaywinners%` | The number of winners |

The dashboard's **Winner message** card has a message editor with a live preview and placeholder list, and the dashboard saves it as you type. The placeholders it lists are `%giveawayitem%`, `%giveawaywinners%`, `%messagelink%`, `%user%`, `%user.mention%`, and `%server%`.

`gdmmessage` with no text offers to preview the stored message with sample values, and declining the preview clears it. Running it with text also clears the stored message rather than saving it, so set custom text on the dashboard.

## Settings

The **Giveaways** dashboard page is one page with three cards: **Giveaways**, **Defaults**, and **Winner message**. There are no tabs.

### Giveaways card

The card has a **New giveaway** button and three views with a count each: **Running**, **Ended**, and **Drafts**. A search box, **Search prizes**, appears once the community has more than four giveaways. Lists show 25 at a time with a button for more.

Each row shows the prize, channel, winner count, end time (or run time for a draft), and badges for roles, message requirement, extra entries, and an XP or coin prize.

| View | Row actions |
| --- | --- |
| Running | **End now**, which asks for confirmation, ends the giveaway, and picks winners |
| Ended | **Reroll**, which picks new winners |
| Drafts | **Start now** and **Delete** |

Select a row to open its details: end time, channel, winners, required roles, and message requirement. For running giveaways and drafts, the details also let you change **Roles with extra entries** and the automatic prize. These save as you edit. Ended giveaways show their extra entries read only.

### New giveaway form

| Setting | Default | What it controls |
| --- | --- | --- |
| Prize | empty | The prize, shown as the embed title. Required. |
| Winners | 1 | How many winners to draw. At least 1. |
| Channel | none | Where the embed is posted. Required. |
| Duration | 1 day | Number plus a unit of **Minutes**, **Hours**, or **Days**. Must be above zero. |
| Emoji | the community default, or the party popper | Emote for reaction entry |
| Requirements | none | **Required roles** and **Messages required** |
| Extra entries | none | Roles that earn extra entries |
| Automatic prize | None | **Type** and **Amount each winner gets** |

The **Requirements**, **Extra entries**, and **Automatic prize** groups are collapsed by default. The form has three buttons: **Cancel**, **Save draft**, and **Start now**. The form will not submit until the required fields are valid.

### Extra entries

Pick a role under **Roles with extra entries**, then set the bonus next to it. Each role starts at +1 and the bonus must be at least 1. A member's entries are one plus the bonus of every listed role they hold, so stacking roles stacks the bonus. Remove a role with the x button.

### Automatic prize

**Type** is **None**, **Coins**, or **XP**. With Coins or XP, the **Amount each winner gets** must be above zero, and the bot credits every winner when the giveaway ends.

To set the prize of a running giveaway or draft from chat, use `gprize <message id or draft id> <none|xp|coins> [amount]`.

### Drafts

**Save draft** stores the giveaway without posting it and keeps the duration you chose. **Start now** on a draft posts it with the host set to you and runs for the saved duration. In chat, `gdraft` saves a draft and `gdrafts`, `gdraftstart` and `gdraftdelete` manage them.

### Defaults card

The **Defaults** card holds **Emoji**, **Ping role**, **Banner image URL**, and **Message color**, described above. Changes save as you edit.

## Setup walkthrough

1. Open **Giveaways** in the dashboard and set the **Defaults** card: **Emoji**, **Message color**, **Banner image URL**, and optionally a **Ping role**.
2. Press **New giveaway**.
3. Fill in **Prize**, **Winners**, **Channel**, and **Duration**.
4. Open **Requirements** if the prize should go to established members.
5. Optionally open **Extra entries** or **Automatic prize**.
6. Press **Start now**, or **Save draft** to start it later from the **Drafts** view.
7. When it ends, check the channel. If the wrong person won or they do not respond, press **Reroll** in the **Ended** view or run `greroll <message id>`.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Manage Messages | Start a giveaway. With no arguments it runs a wizard that also asks for host, message requirement, banner, ping role, and required roles. Time looks like `2d3h`. |
| `gend <message id>` | `giveawayend` | Manage Messages | End a giveaway now and draw winners |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Manage Messages | Draw again from the entrants of an ended giveaway |
| `glist` | `giveaways`, `giveawaylist` | Manage Messages | List active giveaways with message IDs, prizes, winner counts, and links |
| `gstats` | `giveawaystats` | Nobody | Totals of active and ended giveaways, hosts, and per-channel counts |
| `gemote <emote>` | `giveawayemote` | Manage Messages | Set the reaction entry emote |
| `gembedcolor <colour>` | `giveawayembedcolor` | Manage Messages | Set the giveaway embed colour |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Manage Messages | Sets the same colour value as `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Manage Messages | Set the default banner image |
| `gdm` | `giveawaydm` | Manage Messages | Toggle DMs to winners |
| `gdmmessage [text]` | `gdmmsg` | Manage Messages | Preview or clear the custom winner DM |
| `gdraft <#channel> <time> <winners> <prize>` | `giveawaydraft` | Manage Messages | Save a draft without starting it |
| `gdrafts` | `giveawaydrafts` | Manage Messages | List drafts |
| `gdraftstart <draft id>` | `giveawaydraftstart` | Manage Messages | Start a draft |
| `gdraftdelete <draft id>` | `giveawaydraftdelete` | Manage Messages | Delete a draft |
| `gentries <id> <@role> <extra>` | `giveawayentries` | Manage Messages | Give a role extra entries. 0 removes it. |
| `gprize <id> <none, xp or coins> [amount]` | `giveawayprize` | Manage Messages | Set the automatic prize |

## Tips and gotchas

- The message ID for `gend` and `greroll` is the ID of the giveaway embed. Copy it with Developer Mode, or read it from `glist`.
- Reroll picks from the entrants again with the same requirements, so the previous winner can win again. It does not pay the automatic prize.
- After a restart the bot schedules giveaways ending within the next 24 hours straight away; ones ending later are picked up by an hourly check, so a giveaway with a long duration still ends on time.
- If the bot cannot read reactions on a reaction giveaway it falls back to the current community emote, but if the emote was changed to something nobody reacted with, the draw finds no entrants.
- Winner DMs fail silently if the winner has DMs closed. The channel announcement still goes out.
