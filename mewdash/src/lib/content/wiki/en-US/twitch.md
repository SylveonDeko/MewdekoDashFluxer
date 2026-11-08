---
title: Twitch Bot
slug: twitch
summary: Run Mewdeko in your own Twitch chat and send Twitch events into Fluxer
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/alerts?tab=twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub]
related: [streams, administration]
---

## What it does

The Twitch Bot connects one Twitch channel to your Fluxer community and lets Mewdeko act as a chat bot inside that channel. Viewers type `!ping`, `!quote`, `!counter deaths` or your own custom commands in Twitch chat, and the bot answers there. Timers post repeating messages while you are live. Quotes and counters are stored per community, and channel point rewards can trigger a chat reply or a Fluxer post.

Events from the channel flow back into Fluxer. When the channel goes live, a go-live post is sent to a Fluxer channel; subscriptions, gifted subs and raids can each post to their own channel with your own template. An end-of-stream recap can summarise the duration and peak viewers, along with chat messages, subs and raids.

Viewers can link their Twitch account to their Fluxer account. Once linked, the bot knows which community member is chatting on Twitch, and role sync can hand out Fluxer roles to subscribers and VIPs, or to mods and the broadcaster.

> [!NOTE]
> This is not the same as the **Streams** tab. Streams only watches public channels on several platforms and announces when they go live. The Twitch Bot needs you to authorise your own Twitch account and gives the bot a presence in your chat. If both are set up for the same Twitch channel, the Twitch Bot's go-live post replaces the Streams one so you do not get duplicates.

The Twitch Bot lives on the **Alerts** page, on the **Twitch** tab, next to **Streams**, **Feeds** and **Free games**. The tab has seven sections: **Setup**, **Commands**, **Timers**, **Quotes**, **Events**, **Live tools** and **Account links**.

## Why you would use it

- You stream on Twitch and want one bot for both your Fluxer community and your Twitch chat, with the same custom commands and socials in both places.
- You want subs and raids celebrated in Fluxer as they happen.
- You want subscriber or VIP roles in Fluxer without handing them out by hand.
- You want a hydrate or stretch channel point reward to actually say something in chat and log to Fluxer.
- Your mods need a shoutout command, a raid target picker and a quote list that survives between streams.

## Connecting

Two Twitch authorisations are involved, both done from the **OAuth setup** card in **Setup**. The card shows **Connection** (Ready, Needs setup or Not connected), **Bot account** and **Channel**.

| Authorisation | Who does it | What it grants |
| --- | --- | --- |
| Bot account | Bot owner only | The Twitch account the bot chats as. Scopes `user:read:chat`, `user:write:chat`, `user:bot`. One shared identity for every community. **Connect bot** only appears for bot owners. |
| Broadcaster channel | You, the streamer | Access to your channel's events. Scopes `channel:bot`, subscriptions, bits, redemptions, polls, predictions, broadcast management, clip editing and moderation. Use **Connect channel**, or **Reconnect channel** if one is already authorised. |

The integration counts as configured when a bot account exists and your channel is authorised. The config must also be enabled. The **Health** card shows **Transport** (EventSub WebSocket or Legacy IRC), **Last event**, **Bot token** and **Channel token** expiry, then **Missing scopes** for the bot and the channel, and the stored **EventSub** subscriptions.

**Disconnect channel** deletes your authorisation and disables the integration. **Disconnect bot account** only shows for bot owners. Both ask for confirmation.

## Chat commands in Twitch

Every connected channel gets these built-in commands. The prefix is `!` by default and can be changed, up to five characters. Custom commands are looked up only when no built-in matches the name.

| Command | Who can use it | What it does |
| --- | --- | --- |
| `!ping` | Everyone | Replies with a pong |
| `!uptime` | Everyone | How long the bot process has been running |
| `!commands` | Everyone | Lists built-in and enabled custom commands |
| `!discord` | Everyone | Shows which Fluxer account is linked to the caller |
| `!link` | Everyone | Generates a six-digit claim code for account linking |
| `!rank` | Everyone | Shows the caller's resolved rank |
| `!stream` | Everyone | Live status, title, category, viewers and uptime, or "offline" |
| `!schedule` | Everyone | Posts the schedule message set by staff |
| `!socials` | Everyone | Posts the socials message set by staff |
| `!quote [id]` | Everyone | A random quote, or a specific one by number |
| `!quote add <text> [-- author]` | Mod | Saves a quote, optionally with an author after `--` |
| `!quote remove <id>` | Mod | Deletes a quote (`delete` also works) |
| `!counter <name>` | Everyone | Shows a counter's value |
| `!counter <name> +` | Mod | Adds one (`++` or `add` also work); `-`, `--` or `sub` subtract one; `reset` sets it to 0; a number sets it directly |
| `!so <user>` | Mod | Shouts out another Twitch channel |
| `!raidtarget` | Mod | Suggests a random channel from the raid target list |

### Ranks

A chatter's rank comes from their Twitch badges. Broadcaster is highest, then Mod, VIP, Subscriber (founder badges count as subscriber), then Everyone. Commands, custom commands and role sync all compare against this order, so a Mod can run anything set to VIP, Subscriber or Everyone.

## Custom commands

Custom commands are added on the dashboard under **Commands**, in the **Custom commands** card with the **Add** button, or with `twitchcommandadd`. Names are lowercased and may be up to 32 characters. They can contain letters, digits, hyphens and underscores. The editor has a **Command** name, a **Permission** (Everyone, Subscriber, Vip, Mod, Broadcaster), **Cooldown seconds** from 0 to 86400, an **Enabled** toggle and a **Response**. Placeholder buttons under the response insert a variable at the end. The cooldown is shared by the whole channel, not per user. Use counts are tracked by the bot and shown by `twitchcommandlist`.

Fill in **Test args** and press **Test response** to see the rendered response before saving. **Save command** stores it.

The **Command reference** card below lists the built-in **Twitch chat commands** with their permissions, and the Fluxer commands that manage the integration.

### Placeholders in responses

| Placeholder | Value |
| --- | --- |
| `%user%` | The chatter's Twitch login |
| `%display%` | The chatter's display name |
| `%channel%` | Your Twitch channel login |
| `%args%` | Everything typed after the command name |
| `%target%` | The first word after the command name |
| `%discord%` | The chatter's linked Fluxer user ID, or empty |
| `%random:a\|b\|c%` | One option picked at random |
| `%count:name%` | Current value of the named counter |
| `%stream%` | The same summary `!stream` gives |

> [!EXAMPLE]
> `!hug` with response `%display% hugs %target%! That is hug number %count:hugs%.`

## Timers

Timers post a message into Twitch chat on a schedule. Manage them in the **Timers** section with the **Add** button, or with `twitchtimeradd`. **Save timer** stores a timer, and the editor has a **Test** button for existing timers.

| Setting | Default | What it controls |
| --- | --- | --- |
| Timer name | | Same naming rules as commands |
| Interval minutes | 10 | 1 to 1440 minutes between posts |
| Minimum chat messages | 5 | Chat messages that must arrive since the last post before it posts again; 0 to 10000, and 0 disables the check |
| Online only | on | Only post while the channel is live |
| Random rotation | off | Pick a random line instead of cycling through in order |
| Enabled | on | Whether the timer runs |
| Messages | | One message per line |

The list shows each timer's interval, minimum chat, whether it is online only, random or rotating, and when it was last sent. The scheduler checks timers every 30 seconds. Timer lines support `%channel%`, `%url%`, `%stream%`, `%count:name%` and `%random:a|b|c%`. `twitchtimertest` or the **Test** button posts a timer immediately.

## Quotes and counters

Quotes are stored with their text, optional author and who added them. The **Quotes** section lets staff add quotes (**Add quote**, with an optional username as author) and filter or remove them; viewers use `!quote`. Counters are simple named integers that mods bump from chat; staff can set values with `twitchcounterset` and list them with `twitchcounterlist`.

## Events into Fluxer

The **Events** section has three cards: **Event routing** for go-live, **Sub and raid templates**, and **Channel point actions**.

### Go-live and offline

When the channel goes live the bot posts to the **Go-live Fluxer channel** set under **Event routing**. **Send test go-live** posts a test. With no **Go-live message** it sends a default embed: the streamer name linked to the channel, the title as author line, status, viewer count, category and a preview image. A custom message runs through the embed builder, so full embeds work. When the channel goes offline a short red "Offline" embed is posted to the same channel.

| Placeholder | Value |
| --- | --- |
| `%streamer%` | The broadcaster's display name |
| `%title%` | Stream title |
| `%game%` | Category name |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Current viewer count |

### Subscriptions and raids

These are plain text messages. Default sub message: `%display% subscribed to %channel%!`, or `%display% received a gifted sub on %channel%!` for gifts. Default raid message: `%raider% raided %channel% with %viewers% viewers!`.

| Event | Placeholders |
| --- | --- |
| Sub | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

The **Sub and raid templates** card has **Sub Fluxer channel**, **Sub message**, **Raid Fluxer channel** and **Raid message**, each pair with a **Send test sub** or **Send test raid** button.

### Channel point actions

Under **Channel point actions**, press **Add** and map a **Reward title** (matched case-insensitively) to a **Twitch reply**, a **Fluxer channel** with a **Fluxer message**, or both, then **Save action**. Leave **Fluxer channel** on "No Fluxer post" to only reply in Twitch. Placeholders: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (what the viewer typed) and `%url%`.

### Stream recap

`twitchrecapchannel` sets a channel that receives an embed when the stream ends: duration, peak viewers, chat messages, subs, raids, and the last title and category. Recaps are not on the dashboard.

## Account linking and role sync

There are two ways to link a community member to a Twitch login:

1. Self-service: the viewer types `!link` in Twitch chat, gets a six-digit code, and runs `twitchclaim <code>` in Fluxer within ten minutes.
2. Staff: the **Account links** section, where **Add link** takes a **Fluxer user** and a **Twitch username**, or `twitchlink @user twitchlogin`.

One Twitch login per member per community. Once linked, `%discord%` fills in for that viewer and role sync applies.

Role sync maps a Twitch rank to a Fluxer role with `twitchrolesyncadd`. Every time a linked viewer sends a chat message, the bot adds the role if their rank is at or above the mapping and removes it if it is below. Role sync is only available through commands.

## Live tools

The **Live tools** section is titled "Stream operator tools" and uses your channel authorisation. It has four cards:

| Card | What it does |
| --- | --- |
| Send chat | Sends a message as the bot into Twitch chat |
| Marker and clip | **Create marker** with a description, or **Create clip** |
| Poll | **Create poll** with a title, one choice per line (defaults to Yes and No) and a duration in seconds, default 60, from 15 to 1800 |
| Moderation | **Timeout** (default 600 seconds, up to 1209600), **Ban** and **Unban** by Twitch username with an optional reason, and **Delete message** by message ID |

`twitchstreaminfo` updates the title and category from Fluxer, and `twitchclip` makes the clip.

## Settings

Under **Setup**, the **Chat bot** card:

| Setting | Default | What it controls |
| --- | --- | --- |
| Enable Twitch chat bot for this community | on | Master switch; disabling keeps the configuration |
| Command prefix | `!` | Prefix for Twitch chat commands, up to 5 characters |
| Language override | community default | BCP-47 tag such as `de-DE` used for the bot's chat replies |
| Use EventSub for chat events | on | Receive chat and events over EventSub; if off, chat commands do not run |

Under **Events**:

| Setting | Default | What it controls |
| --- | --- | --- |
| Go-live Fluxer channel | none | Where go-live and offline posts go |
| Go-live message | default embed | Custom template with the go-live placeholders |
| Sub Fluxer channel and Sub message | none, `%display% subscribed to %channel%!` | Where sub posts go and their text |
| Raid Fluxer channel and Raid message | none, `%raider% raided %channel% with %viewers% viewers!` | Where raid posts go and their text |

## Setup walkthrough

1. Open **Alerts** in the dashboard and choose the **Twitch** tab. A bot owner must have connected the **Bot account** first; the **OAuth setup** card shows whether one exists.
2. In **Setup**, click **Connect channel** and authorise with your own Twitch account.
3. In the **Chat bot** card, set the prefix and turn on **Enable Twitch chat bot for this community**. Settings save as you change them.
4. In **Commands**, add a couple of custom commands, and in **Timers** a socials timer. Use **Test args** and **Test response** to check placeholders.
5. In **Events**, pick a **Go-live Fluxer channel** and the sub and raid channels, then press **Send test go-live**, **Send test sub** and **Send test raid**.
6. Type `!ping` in your Twitch chat to confirm the bot is listening, then `!link` and `.twitchclaim` to link yourself.
7. Optionally run `.twitchrolesyncadd Subscriber @Subs` so linked subscribers get a role.

## Commands

Run these with your community's prefix (`.` unless you changed it). The Twitch commands have no short aliases. Do not confuse the Fluxer prefix with the Twitch chat prefix, which is `!` by default.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `twitchset <channel> [prefix]` | | Manage Community | Set the Twitch channel and prefix, and enable the integration |
| `twitchremove` | | Manage Community | Disable the integration and leave the channel |
| `twitchenable` | | Manage Community | Turn the integration back on |
| `twitchdisable` | | Manage Community | Turn it off without deleting settings |
| `twitchconfig` | | Nobody | Show channel, prefix, enabled state, go-live channel and language |
| `twitchclaim <code>` | | Nobody | Claim a link code from `!link` |
| `twitchstreaminfo [title] [category]` | | Manage Community | Update the stream title or category |
| `twitchclip` | | Manage Community | Create a clip of the current stream |
| `twitchstatus` | | Manage Community | Health summary: accounts, tokens, EventSub state |
| `twitchlanguage <tag>` | | Manage Community | Language for chat replies; empty resets |
| `twitchprefix <prefix>` | | Manage Community | Change the chat command prefix |
| `twitchcommandadd <name> <response> [permission] [cooldown]` | | Manage Community | Add or update a custom command |
| `twitchcommandremove <name>` | | Manage Community | Delete a custom command |
| `twitchcommandlist` | | Nobody | List custom commands with permission, cooldown and use count |
| `twitchcounterset <name> <value>` | | Manage Community | Set a counter |
| `twitchcounterlist` | | Nobody | List counters |
| `twitchscheduleset <message>` | | Manage Community | Set the `!schedule` reply |
| `twitchscheduleclear` | | Manage Community | Clear it |
| `twitchsocialsset <message>` | | Manage Community | Set the `!socials` reply |
| `twitchsocialsclear` | | Manage Community | Clear it |
| `twitchtimeradd <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Manage Community | Add or update a timer |
| `twitchtimerremove <name>` | | Manage Community | Delete a timer |
| `twitchtimerlist` | | Nobody | List timers |
| `twitchtimerenable <name>` | | Manage Community | Enable a timer |
| `twitchtimerdisable <name>` | | Manage Community | Disable a timer |
| `twitchtimertest <name>` | | Manage Community | Post a timer now |
| `twitchgolive <channel> [message]` | | Manage Community | Set the go-live channel and template |
| `twitchgoliveclear` | | Manage Community | Clear the go-live channel |
| `twitchsubchannel <channel> [message]` | | Manage Community | Set the sub channel and template |
| `twitchsubclear` | | Manage Community | Disable sub posts |
| `twitchraidchannel <channel> [message]` | | Manage Community | Set the raid channel and template |
| `twitchraidclear` | | Manage Community | Disable raid posts |
| `twitchrecapchannel <channel>` | | Manage Community | Set the stream recap channel |
| `twitchrecapclear` | | Manage Community | Disable recaps |
| `twitchlink <@user> <twitchlogin>` | | Manage Community | Link a member to a Twitch login |
| `twitchunlink <@user>` | | Manage Community | Remove a member's link |
| `twitchlinks` | | Nobody | List all links |
| `twitchrolesyncadd <rank> <@role>` | | Manage Community | Give a role to linked viewers at or above a rank |
| `twitchrolesyncremove <rank> <@role>` | | Manage Community | Remove a mapping |
| `twitchrolesynclist` | | Nobody | List mappings |
| `twitchredemptionadd <reward> [twitchreply] [channel] [message]` | | Manage Community | Add or update a channel point action |
| `twitchredemptionremove <reward>` | | Manage Community | Remove one |
| `twitchredemptionlist` | | Nobody | List actions |
| `twitchraidtargetadd <twitchlogin> [note]` | | Manage Community | Add a channel to the `!raidtarget` pool |
| `twitchraidtargetremove <twitchlogin>` | | Manage Community | Remove one |
| `twitchraidtargetlist` | | Nobody | List raid targets |

## Tips and gotchas

- The bot account is shared by every community on the bot. If nobody has connected one, chat replies cannot be sent no matter what you configure.
- Chat commands only work while **Use EventSub for chat events** is on. If the Health panel shows Legacy IRC, switch it back on.
- Live state is also polled once a minute, so a go-live post can lag the actual start by up to a minute.
- Custom command cooldowns are per channel, not per viewer. A 30 second cooldown means one use every 30 seconds for everyone.
- Role sync runs when a linked viewer chats, not on a schedule. A subscriber who never types in chat never gets the role, and a lapsed subscriber keeps it until they chat again.
- Role changes need the bot's role above the synced role and Manage Roles.
- Unknown ranks passed to `twitchrolesyncadd` fall back to Subscriber, and unknown permissions passed to `twitchcommandadd` fall back to Everyone.
- Link codes expire after ten minutes and generating a new one invalidates the old.
- Timeouts and bans from Live tools use your channel's moderation scopes, so they appear in Twitch as actions taken by the authorised account.
- Language override changes only Twitch chat replies. Fluxer replies keep the community locale.
