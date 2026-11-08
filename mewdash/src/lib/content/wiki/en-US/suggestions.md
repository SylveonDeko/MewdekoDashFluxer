---
title: Suggestions
slug: suggestions
summary: Lets members submit ideas for the community to vote on and for staff to answer
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, reactions, accept, deny, consider, implement, threads, placeholders]
related: [administration, afk]
---

## What it does

A member runs `suggest` with their idea, or types it straight into the suggestion channel. The bot deletes the original message and posts a numbered suggestion embed in the suggestion channel, with the vote emotes added as reactions. Each suggestion gets a number that staff use to refer to it later.

Staff then move the suggestion through four states: accept, deny, consider or implement, each with an optional reason. The bot edits the original suggestion message into a coloured status embed and DMs the member who suggested it with the outcome. It can also repost the status embed into a separate channel per state, so accepted ideas live in one place and denied ones in another.

Optionally every suggestion gets a public or private discussion thread. When staff change the state, the thread can be archived automatically.

## Why you would use it

- Feedback channels where ideas get lost among replies; each suggestion becomes its own message with a vote count.
- Communities that want members to see what was accepted and what was rejected, and why, without staff writing announcements.
- Communities that want discussion per idea instead of arguments in the main channel, using threads.
- Staff who want to triage from the dashboard with a reason box instead of remembering suggestion numbers.

## How a suggestion is submitted

There are two ways in, and both go through the same length checks and end up in the suggestion channel.

| Method | What happens |
| --- | --- |
| `suggest <text>` | The command message is deleted and the suggestion is posted. Works from any channel. |
| Typing in the suggestion channel | Any non-bot message that does not start with the prefix is turned into a suggestion and the original is deleted. Members holding the community's staff role are skipped, so staff can talk in the channel normally. |

If the text is longer than **Maximum length** or shorter than **Minimum length** it is rejected. With the command the error shows in the channel and deletes after five seconds; in the suggestion channel the message is deleted and the member is DMed. Mentions inside the suggestion are neutralised in the posted embed.

The default suggestion embed uses the member as author and the text as description, under the title "Suggestion #N". You can replace it with your own embed (see placeholders below).

## Voting

Members vote by reacting. By default each suggestion gets a thumbs up and a thumbs down. You can set up to five custom emotes instead with `suggestmotes` or the **Custom emotes** picker; the bot must be able to use them. Counts are tracked from reaction adds and removes.

`suggestinfo <number>` shows the text, a link to the message, who suggested it (left out when suggestions are anonymous), the current state, who last changed it, how many times the state changed, and the count per emote.

## States

Every suggestion starts as Suggested (shown as Pending on the dashboard). Staff with Manage Messages can move it to one of four states with `accept`, `deny`, `consider` or `implemented`, or from the dashboard. Each state change with a reason shows the reason; without one the field reads "none".

| State | Embed colour | Extra options |
| --- | --- | --- |
| Accepted | Blue | Channel, message and **Archive the thread** in its **Outcomes** block |
| Denied | Red | Channel, message and **Archive the thread** in its **Outcomes** block |
| Considered | Gold | Channel, message and **Archive the thread** in its **Outcomes** block |
| Implemented | Green | Channel, message and **Archive the thread** in its **Outcomes** block |

When a state changes the bot does the following, in this order:

1. Archives the discussion thread if the archive toggle for that state is on.
2. Edits the original message in the suggestion channel into the status embed and removes all reactions. If the original message is gone, a new one is posted.
3. DMs the suggester an embed with the suggestion, the reason and who changed it. The staff confirmation says whether the DM went through or the member had DMs off.
4. Records the new state and who changed it.
5. If a channel is set for that state, posts the status embed there and deletes the previous status message for that suggestion, so a suggestion moving from Considered to Accepted does not leave a stale copy behind.

A suggestion can move between states as many times as you like. There is no command to put it back to Pending.

### The status message

The default status embed has the suggester as author, a title such as "Suggestion #12 Accepted", the suggestion text as description and a **Reason** field. Set your own with `acceptmessage`, `denymessage`, `considermessage` or `implementmessage`, or the message editor in each block of the **Outcomes** card. Use `-` to go back to the default. Custom text is run through the embed parser; if it is not valid embed code it is used as the embed description.

## Placeholders

The suggestion message (posted on submit) supports these, plus the general community placeholders.

| Placeholder | Value |
| --- | --- |
| `%suggest.user%` | Full username of the suggester |
| `%suggest.user.name%` | The suggester's username |
| `%suggest.user.avatar%` | The suggester's avatar URL |
| `%suggest.message%` | The suggestion text, mentions neutralised |
| `%suggest.number%` | The suggestion number |

The accept, deny, consider and implement messages support everything above, including the general community placeholders, and these extras.

| Placeholder | Value |
| --- | --- |
| `%suggest.user.id%` | The suggester's user ID |
| `%suggest.mod.user%` | Full username of the staff member who changed the state |
| `%suggest.mod.name%` | Username of that staff member |
| `%suggest.mod.avatar%` | Their avatar URL |
| `%suggest.mod.message%` | The reason given, or "none" |
| `%suggest.emote1count%` to `%suggest.emote5count%` | Vote count for each emote at the time of the change |

> [!EXAMPLE]
> A plain deny message: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Threads

**Thread Type** opens a discussion thread for every new suggestion.

| Type | Result |
| --- | --- |
| No threads (default) | No thread is created |
| Regular threads | Creates a public thread on the suggestion message |
| Private threads | Creates a private thread in the suggestion channel and adds the suggester |

Threads are named "Suggestion #N Discussion" and archive after a week of inactivity. One thread per suggestion is tracked, and the **Archive the thread** toggle of each outcome archives it when that state is set. Changing the thread type only affects suggestions posted afterwards.

## Anonymous suggestions

Turn on **Anonymous** and suggestions hide who made them. The embed and status messages drop the author line, and `%suggest.user%`, `%suggest.user.id%` and `%suggest.user.name%` become "Anonymous". The avatar placeholder becomes a default avatar. Staff with Manage Messages can still run `suggestwho <number>` to get the author by DM. The member still receives the outcome DM.

## Vote colour

**Recolor at vote lead** turns a suggestion's embed green when upvotes lead by that many votes and red when downvotes lead by that many. When the lead falls back under the number, the embed returns to the community's normal colour. 0 turns it off. The maximum is 1000. It applies to the first two emotes, which are the thumbs up and down by default.

## Settings

The page has no tabs. It shows a **Suggestions** card with the submitted suggestions, followed by the setting cards **Basic settings**, **Outcomes** and **Voting**. Every setting saves as you change it. If a save fails the page says so and undoes the change.

### Basic settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Suggest channel | none (feature off) | Where suggestions are posted and where typed messages become suggestions |
| Thread type | No threads | **No threads**, **Regular threads** or **Private threads** |
| Minimum length | 0 | Shortest suggestion accepted, in characters. Up to 2000 on the dashboard (the bot refuses 2048 or more) |
| Maximum length | not set, shown as 2000 | Longest suggestion accepted. Up to 2000 on the dashboard |
| Recolor at vote lead | 0 (off) | Vote lead that recolours the embed, 0 to 1000 |
| Anonymous | Off | Hide who made each suggestion |
| Suggestion message | default embed | The embed posted when a suggestion is submitted |

### Outcomes

One block each for **Accepted**, **Denied**, **Considered** and **Implemented**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | Extra channel the status embed is copied to |
| Archive the thread | Off | Archive the discussion thread when this state is set |
| Message editor | default embed | The status embed for that state |

### Voting

| Setting | Default | What it controls |
| --- | --- | --- |
| Custom emotes | thumbs up and down | Up to five emotes used for voting. Leaving it empty uses the defaults |

> [!WARNING]
> Nothing works until **Suggest channel** is set. Until then `suggest` replies that no channel is set and deletes the error after three seconds.

### Suggestions card

The **Suggestions** card lists every suggestion with the author, date, text, a status badge and the first two vote counts. Filter with **Status** (**All**, **Pending**, **Accepted**, **Denied**, **Considered**, **Implemented**) and order with **Sort** (**Newest first**, **Oldest first**, **Status**). **Show more** loads further entries. Click a suggestion to open it. The sheet shows the text and the vote counts for each emote, with **Accept**, **Deny**, **Consider** and **Implement** buttons, a **Reason** box, **Apply** and **Delete**. **Delete** removes the record from the database without touching the message in the channel. **Clear all** in the card header deletes every suggestion after confirmation.

## Setup walkthrough

1. Open **Suggestions** in the dashboard.
2. In **Basic settings**, pick a **Suggest channel**, set **Minimum length** and **Maximum length**, for example 10 and 1000, and pick a **Thread type** if you want per-idea discussion.
3. In **Outcomes**, optionally pick separate channels for accepted, denied, considered and implemented suggestions and turn on **Archive the thread** for the states that should close discussion.
4. In **Voting**, optionally pick up to five **Custom emotes**.
5. Customise the status embeds in **Outcomes** if you want, using the placeholders above.
6. Test: run `suggest test idea`, vote on it, and run `accept 1 looks good` to see the status embed and DM.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Nobody | Submit a suggestion |
| `suggestinfo <number>` | `suginfo` | Manage Messages | Show details and vote counts for a suggestion |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Manage Messages | Mark a suggestion accepted |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Manage Messages | Mark a suggestion denied |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Manage Messages | Mark a suggestion as being considered |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Manage Messages | Mark a suggestion implemented |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Manage Channels | Set the suggestion channel, or disable suggestions with no channel |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrator | Delete every suggestion and reset the counter, after confirmation |
| `suggestmessage <text>` | `suggestmsg` | Administrator | Custom suggestion embed, `-` to reset |
| `acceptmessage <text>` | `acceptmsg` | Administrator | Custom accept embed, `-` to reset |
| `denymessage <text>` | `denymsg` | Administrator | Custom deny embed, `-` to reset |
| `considermessage <text>` | `considermsg` | Administrator | Custom consider embed, `-` to reset |
| `implementmessage <text>` | `implementmsg` | Administrator | Custom implement embed, `-` to reset |
| `acceptchannel [#channel]` | | Administrator | Channel for accepted suggestions, none to disable |
| `denychannel [#channel]` | | Administrator | Channel for denied suggestions, none to disable |
| `considerchannel [#channel]` | | Administrator | Channel for considered suggestions, none to disable |
| `implementchannel [#channel]` | | Administrator | Channel for implemented suggestions, none to disable |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrator | Minimum characters, must be under 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrator | Maximum characters, must be above 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrator | Up to five vote emotes, or `disable` for thumbs up and down |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrator | Discussion thread type for new suggestions |
| `archiveonaccept` | | Administrator | Toggle thread archiving on accept |
| `archiveondeny` | | Administrator | Toggle thread archiving on deny |
| `archiveonconsider` | | Administrator | Toggle thread archiving on consider |
| `archiveonimplement` | | Administrator | Toggle thread archiving on implement |
| `suggestanonymous` | `anonsuggest` | Administrator | Toggle anonymous suggestions |
| `suggestvotecolor <number>` | `votecolor` | Administrator | Vote lead that recolours a suggestion, 0 to 1000, 0 turns it off |
| `suggestwho <number>` | `sugwho` | Manage Messages | Get the author of a suggestion by DM |

## Tips and gotchas

- The bot needs Manage Messages in the suggestion channel to delete originals and Add Reactions to vote. Discussion threads need permission to create threads. Status channels need Embed Links or the copy is silently skipped.
- Set both length limits before opening the channel. The typed-message path deletes anything outside the limits, so an unset maximum can eat every message.
- Members with the staff role set in Administration can chat in the suggestion channel without their messages becoming suggestions. Everyone else's messages are converted and deleted.
- The `suggest` command respects the permissions system, so you can block it in channels or for roles with the usual permission commands and the typed-message path respects the same rule.
- Custom emotes must be ones the bot can use. The command tests each emote by reacting with it and refuses the set if one fails.
- Dashboard **Delete** only removes the database record. The message and any thread stay where they are.
- `suggestclear` cannot be undone and resets numbering to 1.
