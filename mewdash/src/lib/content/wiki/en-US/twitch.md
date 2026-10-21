---
title: Twitch Bot
slug: twitch
summary: Run Mewdeko inside your own Twitch chat with custom commands, timers, quotes and counters, and route subs, raids, channel point redemptions and go-live events into Fluxer.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub]
related: [streams, administration]
---

## What it does

The Twitch Bot connects one Twitch channel to your Fluxer server and lets Mewdeko act as a chat bot inside that channel. Viewers type `!ping`, `!quote`, `!counter deaths` or your own custom commands in Twitch chat, and the bot answers there. Timers post repeating messages while you are live, quotes and counters are stored per server, and channel point rewards can trigger a chat reply or a Fluxer post.

Events from the channel flow back into Fluxer. When the channel goes live, a go-live post is sent to a Fluxer channel; subscriptions, gifted subs and raids can each post to their own channel with your own template, and an end-of-stream recap can summarise duration, peak viewers, chat messages, subs and raids.

Viewers can link their Twitch account to their Fluxer account. Once linked, the bot knows which Fluxer member is chatting on Twitch, and role sync can hand out Fluxer roles to subscribers, VIPs, mods or the broadcaster.

> [!NOTE]
> This is not the same as Stream Alerts. Stream Alerts only watches public channels on several platforms and announces when they go live. The Twitch Bot needs you to authorise your own Twitch account and gives the bot a presence in your chat. If both are set up for the same Twitch channel, the Twitch Bot's go-live post replaces the Stream Alerts one so you do not get duplicates.

## Why you would use it

- You stream on Twitch and want one bot for both your Fluxer and your Twitch chat, with the same custom commands and socials in both places.
- You want subs and raids celebrated in Fluxer as they happen.
- You want subscriber or VIP roles on Fluxer without handing them out by hand.
- You want a hydrate or stretch channel point reward to actually say something in chat and log to Fluxer.
- Your mods need a shoutout command, a raid target picker and a quote list that survives between streams.

## Connecting

Two Twitch authorisations are involved, both done from the **Setup** tab, **Connect** sub-tab.

| Authorisation | Who does it | What it grants |
| --- | --- | --- |
| Bot account | Bot owner only | The Twitch account the bot chats as. Scopes `user:read:chat`, `user:write:chat`, `user:bot`. One shared identity for every server. |
| Broadcaster channel | You, the streamer | Access to your channel's events. Scopes `channel:bot`, subscriptions, bits, redemptions, polls, predictions, broadcast management, clip editing and moderation. |

The integration counts as configured when a bot account exists, your channel is authorised, and the config is enabled. The **Health** panel shows the transport (EventSub WebSocket or legacy IRC), the last event received, token expiry for both accounts, and under **Advanced diagnostics** any missing scopes and the stored EventSub subscriptions.

Disconnecting the channel deletes your authorisation and disables the integration. The bot account can only be disconnected by a bot owner.

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

Custom commands are added on the dashboard under **Commands**, **Custom Commands**, or with `.twitchcommandadd`. Names are lowercased, may be up to 32 characters, and can contain letters, digits, hyphens and underscores. Each command has a **Permission** (Everyone, Subscriber, Vip, Mod, Broadcaster), a **Cooldown seconds** value from 0 to 86400, an **Enabled** toggle and a **Response**. The cooldown is shared by the whole channel, not per user. Use counts are tracked and shown in the list.

The dashboard also has a **Test args** field and a preview so you can see the rendered response before saving.

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

Timers post a message into Twitch chat on a schedule. Manage them under **Commands**, **Timers**, or with `.twitchtimerlist` and the other timer commands.

| Setting | Default | What it controls |
| --- | --- | --- |
| Timer name | | Same naming rules as commands |
| Interval minutes | 10 | 1 to 1440 minutes between posts |
| Minimum chat messages | 5 | Chat messages that must arrive since the last post before it posts again; 0 disables the check |
| Online only | on | Only post while the channel is live |
| Random rotation | off | Pick a random line instead of cycling through in order |
| Enabled | on | Whether the timer runs |
| Messages | | One message per line |

The scheduler checks timers every 30 seconds. Timer lines support `%channel%`, `%url%`, `%stream%`, `%count:name%` and `%random:a|b|c%`. `.twitchtimertest` (or the test button on the dashboard) posts a timer immediately.

## Quotes and counters

Quotes are stored with their text, optional author and who added them. The dashboard **Quotes** sub-tab lets staff add, search and remove them; viewers use `!quote`. Counters are simple named integers that mods bump from chat; staff can set values with `.twitchcounterset` and list them with `counter-list`.

## Events into Fluxer

The **Events** tab, **Alerts** sub-tab holds the sub, raid and channel point settings. The go-live post lives under **Setup**, **Bot Settings**, **Event routing**.

### Go-live and offline

When the channel goes live the bot posts to the **Go-live Fluxer channel**. With no **Go-live message** it sends a default embed: the streamer name linked to the channel, the title as author line, status, viewer count, category and a preview image. A custom message runs through the embed builder, so full embeds and components work. When the channel goes offline a short red "Offline" embed is posted to the same channel.

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

Each alert has a **Send test** button on the dashboard, and the **Event history** list shows recent events and test sends.

### Channel point actions

Under **Channel point actions**, map a **Reward title** (matched case-insensitively) to a **Twitch reply**, a **Fluxer channel** with a **Fluxer message**, or both. Placeholders: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (what the viewer typed) and `%url%`.

### Stream recap

`.twitchrecapchannel` sets a channel that receives an embed when the stream ends: duration, peak viewers, chat messages, subs, raids, and the last title and category. Recaps are not on the dashboard.

## Account linking and role sync

There are two ways to link a Fluxer member to a Twitch login:

1. Self-service: the viewer types `!link` in Twitch chat, gets a six-digit code, and runs `.twitchclaim <code>` in Fluxer within ten minutes.
2. Staff: the **Account Links** tab or `.twitchlink @user twitchlogin`.

One Twitch login per Fluxer member per server. Once linked, `%discord%` fills in for that viewer and role sync applies.

Role sync maps a Twitch rank to a Fluxer role with the `twitch rolesync add` command. Every time a linked viewer sends a chat message, the bot adds the role if their rank is at or above the mapping and removes it if it is below.

## Live Tools

The **Events** tab, **Live Tools** sub-tab exposes stream operator actions that use your channel authorisation: send a chat message as the bot, create a stream marker, create a clip, start a poll (one choice per line, default 60 seconds), and time out (default 600 seconds), ban, unban or delete a message by ID. `.twitchstreaminfo` and `.twitchclip` do the title, category and clip parts from Fluxer.

## Settings

Under **Setup**, **Bot Settings**:

| Setting | Default | What it controls |
| --- | --- | --- |
| Command prefix | `!` | Prefix for Twitch chat commands, up to 5 characters |
| Language override | server default | BCP-47 tag such as `de-DE` used for the bot's chat replies |
| Enable Twitch chat bot for this server | on | Master switch; disabling keeps the configuration |
| Use EventSub for chat events | on | Receive chat and events over EventSub; if off, chat commands do not run |
| Go-live Fluxer channel | none | Where go-live and offline posts go |
| Go-live message | default embed | Custom template with the go-live placeholders |

Under **Events**, **Alerts**: **Sub Fluxer channel**, **Sub message**, **Raid Fluxer channel**, **Raid message**, and the channel point action list.

## Setup walkthrough

1. Open **Twitch Bot** in the dashboard. A bot owner must have connected the **Bot account** first; the **Connect** sub-tab shows whether one exists.
2. Click **Connect channel** and authorise with your own Twitch account.
3. In **Bot Settings**, set the prefix, turn on **Enable Twitch chat bot for this server**, pick a **Go-live Fluxer channel** and save.
4. In **Commands**, add a couple of custom commands and a socials timer. Use **Test args** and the preview to check placeholders.
5. In **Events**, **Alerts**, choose sub and raid channels and press **Send test** for each.
6. Type `!ping` in your Twitch chat to confirm the bot is listening, then `!link` and `.twitchclaim` to link yourself.
7. Optionally run `.twitchrolesyncadd Subscriber @Subs` so linked subscribers get a role.

## Commands

Run these with your server prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `.twitchset <channel> [prefix]` | | Manage Server | Set the Twitch channel and prefix, and enable the integration |
| `.twitchremove` | | Manage Server | Disable the integration and leave the channel |
| `.twitchenable` | | Manage Server | Turn the integration back on |
| `.twitchdisable` | | Manage Server | Turn it off without deleting settings |
| `.twitchconfig` | | Nobody | Show channel, prefix, enabled state, go-live channel and language |
| `.twitchclaim <code>` | | Nobody | Claim a link code from `!link` |
| `.twitchstreaminfo [title] [category]` | | Manage Server | Update the stream title or category |
| `.twitchclip` | | Manage Server | Create a clip of the current stream |
| `.twitchstatus` | | Manage Server | Health summary: accounts, tokens, EventSub state |
| `.twitchlanguage <tag>` | | Manage Server | Language for chat replies; empty resets |
| `.twitchprefix <prefix>` | | Manage Server | Change the chat command prefix |
| `.twitchcommandadd <name> <response> [permission] [cooldown]` | | Manage Server | Add or update a custom command |
| `.twitchcommandremove <name>` | | Manage Server | Delete a custom command |
| `.twitchcommandlist` | | Nobody | List custom commands with permission, cooldown and use count |
| `.twitchcounterset <name> <value>` | | Manage Server | Set a counter |
| `.twitchcounterlist` | | Nobody | List counters |
| `.twitchscheduleset <message>` | | Manage Server | Set the `!schedule` reply |
| `.twitchscheduleclear` | | Manage Server | Clear it |
| `.twitchsocialsset <message>` | | Manage Server | Set the `!socials` reply |
| `.twitchsocialsclear` | | Manage Server | Clear it |
| `.twitchtimeradd <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Manage Server | Add or update a timer |
| `.twitchtimerremove <name>` | | Manage Server | Delete a timer |
| `.twitchtimerlist` | | Nobody | List timers |
| `.twitchtimerenable <name>` | | Manage Server | Enable a timer |
| `.twitchtimerdisable <name>` | | Manage Server | Disable a timer |
| `.twitchtimertest <name>` | | Manage Server | Post a timer now |
| `.twitchgolive <channel> [message]` | | Manage Server | Set the go-live channel and template |
| `.twitchgoliveclear` | | Manage Server | Clear the go-live channel |
| `.twitchsubchannel <channel> [message]` | | Manage Server | Set the sub channel and template |
| `.twitchsubclear` | | Manage Server | Disable sub posts |
| `.twitchraidchannel <channel> [message]` | | Manage Server | Set the raid channel and template |
| `.twitchraidclear` | | Manage Server | Disable raid posts |
| `.twitchrecapchannel <channel>` | | Manage Server | Set the stream recap channel |
| `.twitchrecapclear` | | Manage Server | Disable recaps |
| `.twitchlink <@user> <twitchlogin>` | | Manage Server | Link a member to a Twitch login |
| `.twitchunlink <@user>` | | Manage Server | Remove a member's link |
| `.twitchlinks` | | Nobody | List all links |
| `.twitchrolesyncadd <rank> <@role>` | | Manage Server | Give a role to linked viewers at or above a rank |
| `.twitchrolesyncremove <rank> <@role>` | | Manage Server | Remove a mapping |
| `.twitchrolesynclist` | | Nobody | List mappings |
| `.twitchredemptionadd <reward> [twitchreply] [channel] [discordmessage]` | | Manage Server | Add or update a channel point action |
| `.twitchredemptionremove <reward>` | | Manage Server | Remove one |
| `.twitchredemptionlist` | | Nobody | List actions |
| `.twitchraidtargetadd <twitchlogin> [note]` | | Manage Server | Add a channel to the `!raidtarget` pool |
| `.twitchraidtargetremove <twitchlogin>` | | Manage Server | Remove one |
| `.twitchraidtargetlist` | | Nobody | List raid targets |

## Tips and gotchas

- The bot account is shared by every server on the bot. If nobody has connected one, chat replies cannot be sent no matter what you configure.
- Chat commands only work while **Use EventSub for chat events** is on. If the Health panel shows Legacy IRC, switch it back on.
- Live state is also polled once a minute, so a go-live post can lag the actual start by up to a minute.
- Custom command cooldowns are per channel, not per viewer. A 30 second cooldown means one use every 30 seconds for everyone.
- Role sync runs when a linked viewer chats, not on a schedule. A subscriber who never types in chat never gets the role, and a lapsed subscriber keeps it until they chat again.
- Role changes need the bot's role above the synced role and Manage Roles.
- Unknown ranks passed to `.twitchrolesyncadd` fall back to Subscriber, and unknown permissions passed to `.twitchcommandadd` fall back to Everyone.
- Link codes expire after ten minutes and generating a new one invalidates the old.
- Timeouts and bans from Live Tools use your channel's moderation scopes, so they appear in Twitch as actions taken by the authorised account.
- Language override changes only Twitch chat replies. Fluxer replies keep the server locale.
