---
title: Stream Alerts
slug: streams
summary: Announce in a channel when a streamer you follow goes live or posts something new
icon: fa-video
category: Community
dashboard: /dashboard/alerts?tab=streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, tiktok, bluesky, reddit, podcast, streamadd, streamtemplate]
related: [twitch, utility, administration]
---

## What it does

Staff paste a stream URL and pick a channel. The bot then polls that streamer's platform and, when the stream flips from offline to online, posts a go-live message in the chosen channel. By default that is an embed with the streamer's name linked to the stream, the stream title, the game or category, the viewer count, the streamer's avatar and a preview image.

You can replace the default embed with your own message. There is a community-wide template that applies to every followed stream, and each stream can also have its own online message and its own offline message. All of them accept the `%stream.*%` placeholders listed below and can be plain text or a full embed built in the dashboard's embed editor.

Offline notices are off by default. Turn them on and the bot also posts when a followed stream ends, using the stream's offline message if one is set. If not, it uses the community template, and failing that the default embed showing "Offline".

> [!NOTE]
> Stream Alerts announces other people's streams into your community. The separate Twitch Bot feature connects the bot to your own Twitch chat for commands, timers and events. See the Twitch Bot article for that.

## Why you would use it

- A community wants a "now live" channel that lights up whenever one of its creators starts streaming.
- A streamer's own community wants an automatic ping with the title and category so nobody has to post it by hand.
- An esports or event community follows several tournament channels across Twitch and Kick in one place.
- A community wants a clean "stream ended" notice so the go-live post does not look stale.

## Supported platforms

The bot picks the platform from the URL you give it. Only URLs that match one of these patterns can be followed with `streamadd` or the dashboard.

| Platform | URL format | Notes |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Uses the Twitch Helix API. Title, game, viewers, avatar and preview are all filled. |
| YouTube | `youtube.com/@handle` or `youtube.com/channel/ID` | Read by scraping the channel's live page, so data can be less complete than Twitch. |
| Kick | `kick.com/slug` | Uses the Kick public API. |
| Picarto | `picarto.tv/name` | Uses the Picarto API. |
| TikTok | `tiktok.com/@name` | Live status comes from the public profile page. New videos need a video feed source set up by whoever hosts the bot. |

Trovo and Facebook appear in the stored platform list, but there is no working URL matcher for Trovo and no provider for Facebook, so those URLs are rejected when you try to follow them.

Each community can follow up to 10 streams with `streamadd` or the dashboard.

### Other sources

`streamsocial` follows sources that post new items instead of going live. It is a command only, there is no dashboard form for it.

| Source | Command argument | What gets posted |
| --- | --- | --- |
| YouTube uploads | `youtube` or `yt` | A message for each new upload |
| Bluesky | `bluesky` or `bsky` | A message for each new post. Add `true` at the end to include reposts. |
| Subreddit | `reddit` | A message for each new post |
| Podcast | `podcast` | A message for each new episode. Give a feed URL or an Apple Podcasts link. |

Use `podcastsearch <term>` to find a podcast's feed URL. These items use the stream's video message, set with `streamvideomessage`, or a built-in embed if none is set.

## How checking works

The bot keeps one tracker per platform and asks each platform for the state of every followed channel in a loop, pausing three seconds between rounds. A stream is announced as online the first time it is seen live after being offline.

Going offline is handled more carefully because Twitch sometimes reports a brief offline blip during a live stream. A stream has to be seen offline in two consecutive checks before the offline notice is sent. If it comes back online in between, nothing is posted.

Every thirty minutes the bot looks for streams whose platform lookups have been failing for more than twelve hours, for example a deleted or renamed channel, and removes them from every community that followed them.

If a followed stream's notification channel has been deleted, the stream is dropped the next time someone runs `streamlist`.

## The message it sends

When a stream changes state the bot picks a message in this order:

1. The stream's own **Online Message** or **Offline Message**, whichever matches the new state.
2. The community-wide **Global Stream Message** template.
3. The built-in embed.

A per-stream message that is not valid embed JSON is posted as plain text above the built-in embed. A global template that is not embed JSON is posted as plain text on its own. Messages that are valid embed JSON, which is what the dashboard's embed builder produces, are sent exactly as designed.

The built-in embed has the streamer's name as a linked title, the title of the stream as the author line, a **Status** field showing Online or Offline, a **Viewers** field, a **Streaming** field for the game or category, the avatar as a thumbnail and the preview as the large image. It is green while live and red when offline.

### Live message options

Two options exist per stream and are set with commands only:

- `streamlivemessage <index>` keeps the go-live message up to date while the stream runs. The live details are edited into the same message about once a minute, and when the stream ends the message is edited to show it as offline.
- `streamdeleteonend <index>` deletes the go-live message when the stream ends instead.

Both are toggles. Run the command again to turn the option off.

### Placeholders

Only this set is replaced in stream messages. The general community and user placeholders are not available here.

| Placeholder | Value |
| --- | --- |
| `%stream.name%` | Display name of the streamer, or `Unknown` |
| `%stream.username%` | Login name or handle of the streamer |
| `%stream.url%` | Direct link to the stream, always with `https://` |
| `%stream.title%` | Current stream title, or `No title` |
| `%stream.game%` | Game or category, or `No category` |
| `%stream.viewers%` | Viewer count with thousands separators, or `-` when offline |
| `%stream.platform%` | Platform name such as `Twitch` or `Youtube` |
| `%stream.avatar%` | Streamer avatar URL |
| `%stream.preview%` | Stream preview or thumbnail URL |
| `%stream.status%` | `Online` or `Offline`, each prefixed with a coloured circle |
| `%stream.channelid%` | Platform-specific channel ID, where the platform provides one |
| `%stream.duration%` | How long the stream has been live, shown while a live message is kept up to date or when it ends, otherwise `-` |

For uploads, posts and episodes, these extra placeholders are available:

| Placeholder | Value |
| --- | --- |
| `%stream.video.title%` | Title of the latest item |
| `%stream.video.url%` | Link to the latest item |
| `%stream.video.thumbnail%` | Thumbnail or image of the latest item |
| `%stream.video.description%` | Description of the latest item |
| `%stream.video.published%` | When the latest item was published |
| `%episode.title%`, `%episode.url%`, `%episode.description%`, `%episode.audio%`, `%episode.published%`, `%episode.image%` | The same details for a podcast episode, plus the audio link |
| `%podcast.name%` | Name of the podcast |

> [!EXAMPLE]
> A simple global template: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Settings

Streams live on the **Streams** tab of the **Alerts** page. The tab has three cards.

| Card | Setting | Default | What it controls |
| --- | --- | --- | --- |
| Follow a stream | Channel | none | The channel a new stream's alerts go to |
| Follow a stream | Stream URL | none | The link to follow, for example `https://twitch.tv/name` |
| Streams | Online message | none | Per-stream message when it goes live, opened from the stream's row |
| Streams | Offline message | none | Per-stream message when it ends, opened from the same row |
| Messages | Message for all streams | none | Community-wide template used when a stream has no message of its own |
| Messages | Post when a stream goes offline | Off | Whether the bot posts when followed streams go offline |

In **Follow a stream**, pick a channel, paste the link and press **Follow stream**. The button stays disabled until both are filled.

The **Streams** card lists every followed stream with its platform and channel. A row shows an **Online** or **Offline** badge when the stream has its own message for that state. Click a row to open **Messages for** that streamer, with **Online message** and **Offline message** editors. Both save as you type and an empty message resets to the default. The bin button on a row asks before it unfollows. **Unfollow all** appears when more than one stream is followed and also asks first. With none followed the card says **No streams yet**.

## Setup walkthrough

1. Open **Alerts** in the dashboard and go to the **Streams** tab.
2. In **Follow a stream**, pick the channel, paste the **Stream URL**, and press **Follow stream**.
3. In **Messages**, build the **Message for all streams** in the embed editor using the placeholders above. Skip this to keep the built-in embed.
4. Turn on **Post when a stream goes offline** if you want "stream ended" posts as well.
5. Click a stream's row to give it its own online or offline message if it needs something different from the default.
6. Test with `streamcheck <url>` to confirm the bot can read the stream, then wait for the next go-live.

## Commands

Run these with your community's prefix (`.` unless you changed it). `<index>` is the number shown by `streamlist`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Manage Messages | Follow a stream and send its alerts to the current channel |
| `streamsocial <platform> <target> [reposts]` | `stsocial` | Manage Messages | Follow YouTube uploads, a Bluesky account, a subreddit or a podcast |
| `podcastsearch <term>` | `podsearch` | Nobody | Search for podcasts and show their feed URLs |
| `streamremove <index>` | `strm` | Manage Messages | Unfollow the stream at that position in `streamlist` |
| `streamsclear` | `stclear` | Administrator | Unfollow every stream in the community |
| `streamlist` | `stl`, `streamslist` | Nobody | Paged list of followed streams with their numbers, platforms and channels |
| `streamoffline` | `sto`, `stoff` | Manage Messages | Toggle offline notifications |
| `streammessage <index> <message>` | `stm`, `stmsg` | Manage Messages | Set a stream's online message; an empty message resets it |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Manage Messages | Set a stream's offline message; an empty message resets it |
| `streamvideomessage <index> [message]` | `stvmsg`, `stvm` | Manage Messages | Set the message for new uploads, posts or episodes; an empty message resets it |
| `streamlivemessage <index>` | `stlive`, `stlm` | Manage Messages | Toggle keeping the go-live message up to date |
| `streamdeleteonend <index>` | `stdeleteonend`, `stdoe` | Manage Messages | Toggle deleting the go-live message when the stream ends |
| `streamtemplate [template]` | `stt`, `sttemplate` | Manage Messages | Show the global template and placeholders, set a new one, or `reset` to clear it |
| `streamcheck <url>` | `stc` | Nobody | Report whether a stream is live right now and its viewer count |

## Tips and gotchas

- `streamadd` uses the channel you run it in. Use the dashboard if you want to pick a different channel.
- Stream numbers come from `streamlist` and start at 1. They shift when a stream is removed, so check the list before removing by number.
- The bot needs Send Messages and Embed Links in the notification channel. Alerts to a channel it cannot see are skipped with a log entry.
- If your community has the Twitch Bot connected with a go-live channel set for the same Twitch channel, that integration takes over and Stream Alerts stays silent for it, so you do not get two posts.
- YouTube live data is scraped rather than read from an API. Titles, categories and viewer counts may be missing or read as `Live Stream`.
- Streams whose lookups keep failing for twelve hours are removed automatically. If a streamer renames their channel, follow the new URL.
