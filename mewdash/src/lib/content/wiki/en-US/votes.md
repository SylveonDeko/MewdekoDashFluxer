---
title: Votes
slug: votes
summary: Thanks members who vote for your community on FluxerList and rewards them with roles
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, fluxerlist, vote rewards, vote roles, api key, leaderboard]
related: [administration, xp]
---

## What it does

This is not a poll feature. Votes tracks the votes your community receives on FluxerList and rewards the people who cast them. Mewdeko checks your listing for new voters every 15 minutes. For each new vote it records the vote and posts a thank-you in your vote channel with that member's running total. It also hands out any roles you configured as vote rewards.

From a member's point of view: they vote for the community on FluxerList, then within about 15 minutes a message appears in the vote channel mentioning them and showing how many times they have voted. If you set up vote roles, they get those roles at the same time, either permanently or for a set duration.

From staff's point of view: you save a FluxerList API key and set a vote channel, with an optional custom message and any reward roles you like. After that the bot handles every vote on its own. `votes` and `votesleaderboard` let anyone check counts, and `hasvoted` checks whether a member currently has a vote.

FluxerList has no webhooks, so Mewdeko reads your listing's voter list with your API key. The key must belong to the owner of the community's FluxerList listing.

## Why you would use it

- You list your community on FluxerList and want a visible thank-you every time someone votes.
- You want to give voters a "Voter" role, or a temporary perk role that expires after a set time.
- You want a monthly voter leaderboard to run a "top voter" reward.
- You want members to be able to check their own vote count without asking staff.

## How a vote is processed

1. Every 15 minutes the bot reads the newest voters on your listing and compares them with the voters it already knows about.
2. Each new voter is saved with their ID and the time.
3. If a vote channel is set, the bot posts the thank-you message there. With no vote channel nothing is posted.
4. Every vote role is added to the member. Roles with a timer are removed again when the timer runs out, using the same timed role system as mutes.
5. Once a day the bot reads the full voter list. Members who removed their vote lose any vote role that has no duration. Timed roles run out on their own.

Votes on FluxerList are a toggle that lasts until the member removes it, so there is no 12-hour expiry. A member who removes their vote and votes again counts as a new vote.

When you first save a key, votes that already exist are noted silently. Only votes cast after that trigger messages and roles.

> [!WARNING]
> Your API key can read your listing's voters. Mewdeko stores it encrypted and never shows it again. Anyone with the key can use it, so only paste it on the dashboard and remove it there if it leaks.

## The thank-you message

By default the bot sends a mention of the voter and an embed titled "Thanks for voting for <community>". The embed has a line with their total vote count and uses their avatar as the thumbnail.

You can replace this with your own text or embed using `votemessage` or the message editor on the dashboard. The text goes through the embed parser, so anything the embed builder produces works. Set it to `-` in the command, or use **Reset to default** on the dashboard, to go back to the default.

### Placeholders

The custom message supports the general placeholder set (user, community, channel, bot and time placeholders from the placeholders page) plus two vote-specific ones.

| Placeholder | Value |
| --- | --- |
| `%votestotalcount%` | How many times this member has voted in total |
| `%votesmonthcount%` | How many times they have voted in the current calendar month |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | The voter |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Your community |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

Running `votemessage` with no text previews the current message as it would look for you, using your own vote counts.

## Vote roles

A vote role is given to every voter. Each role has an optional duration in seconds; `0` means the role is permanent.

- The `@everyone` role cannot be added.
- A role cannot be added twice; use `voteroleedit` to change its duration.
- Timed roles are removed automatically when the duration passes.
- Roles with no duration are removed when the member removes their vote on FluxerList.
- If the bot cannot assign a role (for example, the role is above the bot's highest role) it skips that role silently.

## Vote counts and leaderboard

`votes` shows a member's votes this month and in total, with their avatar. `votesleaderboard` ranks everyone in the community by total votes, twelve per page. Pass `true` to rank by this month's votes only. Both "month" figures compare the calendar month, not the last thirty days.

`hasvoted` asks FluxerList right now whether a member has an active vote. Answers are cached for two minutes and each community can run about 30 checks an hour.

## Settings

The Vote management page has three tabs: **Configuration**, **Vote roles** and **Statistics**. Changes save as you make them, except the API key, which saves with **Save key**.

### Configuration

The **Delivery** card holds the channel and the FluxerList key. The **Vote message** card holds the message.

| Setting | Default | What it controls |
| --- | --- | --- |
| Vote announcement channel | No channel selected | Where thank-you messages are posted |
| FluxerList API key | none | The key Mewdeko reads your listing's voters with. It shows **Key saved** once set, with **Replace** and **Remove**. Below it are the last sync time and any last error |
| Custom vote announcement | default embed | Your own message or embed with a live preview and the placeholders above. **Reset to default** appears once a custom message is set |

### Vote roles

The **Add vote role** card has **Role to grant**, **Lasts** and **Unit** (Seconds, Minutes, Hours or Days). Leave **Lasts** empty or at 0 for a permanent role. The role list only offers roles that are not already vote roles, and never `@everyone`.

The **Vote roles** card lists every vote role with its own **Lasts** and **Unit** fields, which save as you edit them, and a delete button per role. **Clear all** removes every vote role after confirmation.

### Statistics

The **Statistics** tab shows **Total votes**, **This month** and **Voters**, then the **Vote leaderboard** (top ten by total votes) and **Recent votes**.

## Setup walkthrough

1. On FluxerList, make sure your community has a listing and that you are signed in as its owner.
2. Open the **Developer** tab of the FluxerList dashboard and create an API key.
3. Open **Votes** in Mewdeko's dashboard and stay on **Configuration**.
4. Paste the key into **FluxerList API key** and press **Save key**. Mewdeko checks that the key's account owns this community's listing and tells you if it does not.
5. Pick a **Vote announcement channel**.
6. Optionally write a **Custom vote announcement** using the placeholders above.
7. On **Vote roles**, choose a **Role to grant**, set how long it **Lasts**, then press **Add vote role**. Repeat for every role you want.
8. Make sure the bot's role sits above every vote role in the role list.
9. Vote for your community and check the vote channel within about 15 minutes.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Manage Community | Set the channel for thank-you messages |
| `votemessage [text]` | `votemsg` | Manage Community | Preview or set the custom message, or reset it with `-` |
| `voteroleadd <@role> [time]` | `vra` | Manage Community | Add a vote role, optionally timed, for example `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Manage Community | Change how long a vote role lasts |
| `voteroleremove <@role>` | `vrr` | Manage Community | Remove one vote role |
| `voteroleslist` | `vrl` | Manage Community | List vote roles and their durations |
| `voterolesclear` | `vrc` | Manage Community | Remove every vote role, after confirmation |
| `votes [@user]` | | Nobody | Show a member's monthly and total votes |
| `votesleaderboard [true]` | `voteslb` | Nobody | Rank voters by total, or by this month with `true` |
| `hasvoted [@user]` | `voted`, `votecheck` | Nobody | Check whether a member currently has a vote on FluxerList |

## Tips and gotchas

- Only FluxerList votes are supported, and this feature does not create polls.
- The API key must belong to the community owner's FluxerList account. A co-admin's key is not accepted.
- Votes show up after the next 15-minute check, not instantly.
- FluxerList limits each key to 3,000 requests per 30 days. Mewdeko stays well inside that. If FluxerList rate limits the key, the dashboard shows the error and Mewdeko waits before trying again.
- No vote channel means no thank-you message. Roles are still given and the vote is still counted.
- The bot needs Manage Roles and its role must be above every vote role, or role rewards fail silently.
- Timed vote roles use the same timed role system as timed mutes and appear in the audit log with the reason "Vote Role".
