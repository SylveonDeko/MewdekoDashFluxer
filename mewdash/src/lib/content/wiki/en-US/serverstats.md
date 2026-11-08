---
title: Activity Stats
slug: serverstats
summary: Activity charts for the whole community or for a single member
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, voice time, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## What it does

The bot already counted messages. Activity Stats adds voice time and hourly member and status snapshots. You can ask about any of it over a window of a day, a week, a month, up to ninety days, or all time. Everything is available in the dashboard, as commands, as charts and as CSV, and it feeds stat roles, live boards, reports and stat channels.

## What is tracked

| Data | How |
| --- | --- |
| Messages | Every counted message with a timestamp, kept for ninety days, plus lifetime totals per member and channel |
| Voice time | A segment per member per channel, split whenever they move, mute, deafen, start streaming or turn on their camera, kept for ninety days, plus lifetime totals |
| Snapshots | Member, human, bot, online, idle, DND, offline and in-voice counts every hour, kept for ninety days |
| Joins and leaves | Every join and leave with a timestamp |

Windows up to ninety days read the timestamped data. **All time** reads the lifetime totals, so it keeps working after the ninety day data ages out.

## Games and apps

Fluxer presences carry only a status, so the bot does not record games or apps. Nothing new is counted and nobody shows as playing right now. Totals stored earlier still appear in the game rankings and lookups. The **Track games and apps** and **Verify activities** switches and the **Activity filter** exist in the settings but have nothing to act on.

## Dashboard tabs

| Tab | What it shows |
| --- | --- |
| Overview | **Community activity**: messages, **Voice time**, chatters, joins, leaves, **Net growth**, **Members now**, **Top chatter**, **Top voice** and **Busiest channel**, and charts for messages, **Voice hours**, members, **Member status** (**Online**, **Idle**, **DND**, **In voice**) and **Joins and leaves**. A **Time window** picker sets the range |
| Rankings | Members and channels ranked by messages or voice time. **CSV** exports the ranking. Click a member or channel to open it |
| Member & channel | **Look up** a member (messages, voice time, ranks, **Lifetime messages**, **Lifetime voice**, **Chats most in**) or a channel (**Top chatters**, **Voice channels**) |
| Settings | **Tracking settings**, **Voice states that do not count**, and ignored channels, roles and members |

The tab is kept in the address as `?tab=overview`, `top`, `lookup` or `settings`.

## Settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Default window (days) | 14 | What commands and the page use when no window is given, 1 to 90 |
| Message cooldown (seconds) | 0 | Counts a member's messages once per this many seconds. 0 counts all |
| Track voice time | on | Whether voice segments are recorded, per member and channel |
| Hourly snapshots | on | Whether member and status counts are sampled every hour for the charts |
| Count bots | off | Whether bot accounts are included |
| Voice states that do not count | none | Toggle any of **Self muted**, **Self deafened**, **Community muted**, **Community deafened**, **AFK channel**, **Alone**, **Streaming**, **Camera on** to leave that time out of voice stats |
| Ignored channels, Ignored roles, Ignored members | none | Nothing from these is counted. Add each with its picker and **Add** |

Settings save as you change them.

## Privacy

Any member can run `statsprivacy` to opt out. Their recorded messages and voice time are deleted in every community the bot shares with them, and nothing new is recorded until they run it again to opt back in. Community admins cannot override it.

## Commands

Run these with your community's prefix (`.` unless you changed it). `days` is the window; 0 means all time and leaving it out uses the community default.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats`, `activitystats` | Nobody | The community overview |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Nobody | A member's messages, voice time, ranks, lifetime totals and top channels |
| `channelactivity [#channel] [days]` | `cstats` | Nobody | A channel's activity and top members |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topactivity`, `topchatters`, `topvoice` | Nobody | Rank members |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Nobody | Rank channels |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice] [days]` | `statschart`, `graph` | Nobody | A chart image |
| `activityexport [Messages/Voice/Activity] [days]` | `exportactivity` | Manage Community | A CSV ranking |
| `statssettings` | `activitysettings` | Manage Community | Show the settings |
| `statslookback <days>` | `lookback` | Manage Community | Default window |
| `statscooldown <seconds>` | | Manage Community | Message cooldown |
| `statstrackvoice` | `trackvoice` | Manage Community | Toggle voice tracking |
| `statstracksnapshots` | `tracksnapshots` | Manage Community | Toggle hourly snapshots |
| `statscountbots` | | Manage Community | Toggle counting bots |
| `statsignorevoicestate <state>` | `ignorevoicestate` | Manage Community | Toggle whether a voice state counts |
| `statsignore <#channel, @role or @user>` | `activityignore` | Manage Community | Exclude a channel, role or member |
| `statsignored` | `activityignored` | Manage Community | List exclusions |
| `statsprivacy` | `activityprivacy`, `optoutstats` | Nobody | Opt out of, or back in to, tracking everywhere |

## Tips and gotchas

- Member and status charts start filling an hour after snapshots are enabled; there is no history before that.
- Voice time only counts while the bot is running. A restart closes and reopens every session, so nothing is lost, but the segment boundaries move.
- Excluding a channel hides its history from every query as well as stopping new counts, so old numbers change too.
- Message counting itself still has to be on (the Message Stats page toggle) for message numbers to appear here.
