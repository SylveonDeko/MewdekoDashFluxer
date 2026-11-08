---
title: Music
slug: music
summary: Play music in a voice channel, with a queue and saved playlists
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links]
related: [utility, administration]
---

## What it does

A member joins a voice channel and runs `play` with a link or a search. The bot joins and starts playing the track. Links from YouTube, YouTube Music, SoundCloud and Spotify are resolved directly, and Spotify tracks, albums and playlists are matched to playable tracks. A plain search lists up to 10 results and the member replies with the number of the one they meant.

Each voice channel has its own player and queue, so a community can run music in several voice channels at once. Everyone in a channel shares that channel's queue. Members can view it, jump to an entry, move or remove tracks, shuffle, loop a track or the whole queue, and save the queue as a named playlist to load again later. Members with the DJ role skip instantly, and everyone else can vote.

Staff pick a music channel where now playing and queue empty notices go and set the DJ role, the default volume and the repeat mode. They can also turn on audio filters such as bass boost or nightcore. The dashboard shows the live player with an up next list, repeat buttons and filter toggles.

Two extras live in the same module. Text to speech reads chat messages aloud in a voice channel, with per user voices and a block list. Last.fm lets members scrobble what the bot plays and run `fm` style commands about their listening.

## Why you would use it

- A hangout voice channel wants background music that anyone can add to without one person DJing all night.
- Staff want a DJ role so only trusted members can skip instantly, while everyone else votes.
- A community keeps a few house playlists that get loaded at the start of every event.
- A voice channel has members who cannot talk and want their messages read aloud.
- Music fans want a shared place to compare Last.fm stats and "who knows this artist" leaderboards.

## Playing and the queue

You must be in a voice channel for almost every music command. Commands act on the player in the voice channel you are in.

`play <link or search>` accepts:

| Input | What happens |
| --- | --- |
| YouTube or YouTube Music link | Loaded directly, playlists included |
| SoundCloud link | Loaded directly |
| Spotify track link | Matched to a playable track |
| Spotify album or playlist link | Each entry matched and queued as it resolves, with a progress message |
| Anything else | Searched, listing up to 10 results. Reply with the number to queue it. Several numbers separated by spaces or commas queue several tracks |

A search can start with a source name to pick where it looks, for example `spotify: song name` or `soundcloud: song name`. Known sources include YouTube, YouTube Music, SoundCloud, Bandcamp, Spotify, Apple Music, Deezer and Tidal.

`play <number>` jumps to that queue position. `search <query>` lists ten results without queueing anything. `queue` shows a paged view, five per page. `nowplaying` shows the current track with its requester and provider.

`songremove <number>` removes an entry, `movesong <from> <to>` reorders, `shuffle` shuffles everything after the current track, and `clearqueue` empties the queue and stops. `seek mm:ss` jumps within the current track. `volume 0..100` sets the volume and saves it as the community default.

`loop <type>` sets repeat: `none`, `track` or `queue`. When the queue ends with repeat off, the bot posts a queue empty notice in the music channel.

### Skipping and the DJ role

`skip` ends the current track immediately for whoever runs it. `voteskip` counts votes: a member with the DJ role skips at once, everyone else adds a vote, and the track skips when votes reach 70 percent of the non bot members in the voice channel.

Set the DJ role with `setdjrole @role` or the dashboard's **DJ role** selector. Run `setdjrole` with no role to remove it.

### Autoplay

`autoplay <0..5>` makes the bot add that many related tracks when the queue runs dry, using Spotify recommendations. 0 turns it off. This depends on the bot having Spotify credentials configured; if they are missing autoplay does nothing.

## Playlists

`saveplaylist <name>` stores the current queue under a name, per community, with you as the author. `loadplaylist <name> [true]` appends it to the queue, or replaces the queue if you pass `true`, and starts playing if nothing is. `playlists` lists them with track counts and authors, and `deleteplaylist <name>` removes one.

## Audio filters

Filters apply to the running player and are reset when it disconnects.

| Command | Effect |
| --- | --- |
| `bass <0..1>` | Boosts low frequencies; 0 turns it off |
| `nightcore [on/off]` | Faster and higher pitched |
| `vaporwave [on/off]` | Slower and lower pitched |
| `karaoke [on/off]` | Suppresses centred vocals |
| `tremolo [on/off]` | Volume wobble |
| `vibrato [on/off]` | Pitch wobble |
| `eightd [on/off]` | Rotates the sound around the listener |
| `distortion [on/off]` | Distortion |
| `stereowiden [on/off]` | Widens the stereo image |
| `lowpass [smoothing]` | Muffles high frequencies; 0 turns it off |
| `echo [delay] [decay]` | Adds an echo; `echo 0` turns it off |
| `normalize [on/off]` | Evens out the volume |

`activefilters` lists what is on and `resetfilters` clears them all. The dashboard's **Now playing** card has an **Audio filters** section with toggle buttons for bass boost, nightcore, vaporwave, karaoke, tremolo, vibrato, 8D rotation and distortion.

## Music link conversion

In channels where it is enabled, posting an Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora or SoundCloud link gets a reply embed showing the track and its artwork, along with links to the same track on the other providers. Toggle a channel with `musiclinkchannel [#channel]` (Manage Community) and list them with `musiclinkchannels`. On the dashboard this is the **Music link conversion** card on the **Player** tab.

## Text to speech

TTS reads messages aloud in a voice channel the bot is sitting in. Staff enable it per voice channel; messages from members in that voice channel, typed in the voice channel's text chat or in a linked text channel, are queued and spoken. Music ducks to 15 percent while a line is read and comes back afterwards. The queue holds 10 messages by default.

Members pick their own voice with `ttsvoice <name>` and browse with `ttsvoices [search]`. Staff set a default voice, speed (0.5 to 3.0 on the dashboard, 0.5 to 2.0 by command), volume, a required role, join and leave announcements with their own formats, and can block individual users. The **Text to speech** tab on the dashboard has the same controls, split into **General TTS settings**, **TTS behavior**, **Voice channel TTS** and **Blocked TTS users**.

Each TTS voice channel can also join automatically. With `ttsautojoin` on, the bot enters the channel when a member does and leaves once it is empty.

## Last.fm

Members link a Last.fm account from the dashboard's `/me` page (`lastfmlink` posts the link to it). Once linked, tracks the bot plays long enough are scrobbled to their account; `lastfmtoggle` pauses that and `lastfmstatus` shows the state. The `fm` family of commands then works for anyone with a linked account: recent tracks, top artists, albums and tracks by period, artist and album lookups, who knows leaderboards across the community, crowns, taste comparison and collage charts.

## Settings

The Music page has two tabs, **Player** and **Text to speech**. Changes save automatically.

### Player tab

When the bot is playing, a **Now playing** card appears at the top and refreshes every five seconds. It shows the track, artist and voice channel, and has these controls.

| Control | What it does |
| --- | --- |
| Previous, Pause or Play, Skip | Basic playback |
| Shuffle queue | Shuffles the upcoming tracks; needs at least two |
| Clear queue | Empties the queue after confirmation; the current track keeps playing |
| Off, Track, Queue | Repeat mode for the running player |
| Audio filters | Toggles for Bass boost, Nightcore, Vaporwave, Karaoke, Tremolo, Vibrato, 8D rotation and Distortion |
| Up next | The next ten tracks, each with a play now and a remove button, plus a "+N more" count |

Below it are three cards.

| Setting | Default | Card | What it controls |
| --- | --- | --- | --- |
| Default volume | 100 | Playback | Starting volume, 0 to 100; `volume` also saves here |
| Music channel | All channels | Playback | Where now playing and queue notices are posted |
| DJ role | No DJ role | Playback | Role that skips instantly and bypasses vote skip |
| Repeat mode | Off | Playback | Off, Single track or Queue |
| Auto disconnect | Never | Playback | Never, When voice empty, When queue empty or Either condition |
| Autoplay tracks | 0 | Playback | Related tracks added when the queue runs out, 0 to 5; 0 is off |
| Vote skip switch | Off | Vote skip | Shows the vote skip requirement in the player footer |
| Vote skip threshold | | Vote skip | Percent, 1 to 100. Displayed only; the `voteskip` command itself always needs 70 percent |
| Add channel | none | Music link conversion | Channels where music links get a cross provider embed. Each can be removed with the trash button |

> [!NOTE]
> Repeat mode set on the dashboard applies from the next player. `loop` and the repeat buttons in **Now playing** change the running player straight away.

### Text to speech tab

| Setting | Default | Card | What it controls |
| --- | --- | --- | --- |
| TTS volume | 100 | General TTS settings | Loudness of spoken lines, 0 to 100 |
| TTS speed | 1.0x | General TTS settings | 0.5 to 3.0 |
| Max queue size | 10 | General TTS settings | Pending TTS messages, 1 to 50 |
| Required role | No role required | General TTS settings | Only members with this role can use TTS; admins always can |
| Default voice | provider default | General TTS settings | Voice used when a member has not picked one. Type a name or search voices and click one |
| Reply context | On | TTS behavior | Reads "replying to user" before replies |
| Attachment narration | On | TTS behavior | Announces sent images, videos and files |
| Consecutive grouping | On | TTS behavior | Skips the name when the same member sends several messages in a row |
| Voice channel TTS | none | Voice channel TTS | Pick a voice channel and press **Enable TTS**. Open an entry to change **Enabled**, **Linked text channel**, **Join automatically**, **Announce join/leave** and the **Join format** and **Leave format** |
| Blocked TTS users | none | Blocked TTS users | Enter a user ID and press **Block**, or **Unblock** an entry |

**Join automatically** makes the bot join that voice channel by itself when a member enters and leave once it is empty, even if it was not connected. The format boxes accept `%user.name%`, `%user.mention%`, `%user.id%`, `%server.name%`, `%server.members%` and `%channel.name%`.

## Setup walkthrough

1. Make sure the bot has Connect and Speak in the voice channels you want it to use.
2. Open **Music** in the dashboard. In **Playback**, set a **Music channel** so now playing embeds do not land in general chat.
3. Pick a **DJ role** for the people allowed to skip freely.
4. Set **Default volume** to around 50; 100 is loud.
5. Join a voice channel and run `play never gonna give you up`, pick a result, then `queue` and `nowplaying`. The **Now playing** card shows it on the dashboard.
6. Build a house playlist by queueing tracks and running `saveplaylist chill`.
7. If you want TTS, open **Text to speech**, add the voice channel under **Voice channel TTS**, and have members pick a voice with `ttsvoice`.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Nobody | Join your voice channel |
| `leave` | `disconnect`, `d` | Nobody | Leave and clear the queue |
| `play <link or search>` | `p`, `start` | Nobody | Queue and play |
| `play <number>` | `p`, `start` | Nobody | Jump to a queue position |
| `search <query>` | `find` | Nobody | List ten results without playing |
| `pause` | | Nobody | Pause or resume |
| `nowplaying` | `np` | Nobody | Show the current track |
| `queue` | `q`, `yq`, `enqueue` | Nobody | Show the queue |
| `skip` | `next`, `n` | Nobody | Skip the current track |
| `voteskip` | `vskip` | Nobody | Vote to skip, instant with the DJ role |
| `songremove <number>` | `trackremove`, `srm` | Nobody | Remove a queue entry |
| `movesong <from> <to>` | `ms`, `move` | Nobody | Reorder the queue |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Nobody | Shuffle the upcoming tracks |
| `clearqueue` | `cq` | Nobody | Empty the queue and stop |
| `volume <0..100>` | `vol` | Nobody | Set and save the volume |
| `seek <mm:ss>` | | Nobody | Jump within the current track |
| `loop <none, track or queue>` | `queuerepeat`, `qrp` | Nobody | Set repeat mode |
| `autoplay <0..5>` | `ap` | Nobody | Related tracks when the queue empties |
| `setdjrole [role]` | `djrole` | Manage Community | Set or clear the DJ role |
| `setmusicchannel [#channel]` | `smch` | Nobody | Where player notices go |
| `musicsettings` | `msettings` | Nobody | Show autoplay, volume, repeat and channel |
| `musiclinkchannel [#channel]` | | Manage Community | Toggle link conversion in a channel |
| `musiclinkchannels` | | Nobody | List link conversion channels |
| `saveplaylist <name>` | `saveplist` | Nobody | Save the queue |
| `loadplaylist <name> [clear]` | `loadplist` | Nobody | Load a playlist, `true` to replace the queue |
| `playlists` | `playlistshow`, `plshow` | Nobody | List saved playlists |
| `deleteplaylist <name>` | `delplist` | Nobody | Delete a playlist |
| `bass [0..1]` | | Nobody | Bass boost |
| `nightcore [on/off]` | `nc` | Nobody | Nightcore filter |
| `vaporwave [on/off]` | `vw` | Nobody | Vaporwave filter |
| `karaoke [on/off]` | | Nobody | Karaoke filter |
| `tremolo [on/off]` | | Nobody | Tremolo filter |
| `vibrato [on/off]` | | Nobody | Vibrato filter |
| `eightd [on/off]` | `8d` | Nobody | 8D rotation filter |
| `distortion [on/off]` | | Nobody | Distortion filter |
| `stereowiden [on/off]` | `swiden` | Nobody | Stereo widening |
| `lowpass [smoothing]` | `rpl` | Nobody | Low pass filter |
| `echo [delay] [decay]` | | Nobody | Echo filter |
| `normalize [on/off]` | `normalization` | Nobody | Volume normalization |
| `resetfilters` | `resetfx` | Nobody | Clear all filters |
| `activefilters` | `activefx` | Nobody | List active filters |
| `lastfmlink` | `lflink` | Nobody | Get the link to connect Last.fm |
| `lastfmunlink` | `lfunlink` | Nobody | Remove your Last.fm link |
| `lastfmtoggle` | `lftoggle` | Nobody | Pause or resume scrobbling |
| `lastfmstatus` | `lfstatus` | Nobody | Show your Last.fm link state |
| `fm [user]` | | Nobody | Now playing or last scrobble |
| `fmrecent [user]` | `fmr` | Nobody | Recent scrobbles |
| `fmtopartists [period] [user]` | `fmta` | Nobody | Top artists |
| `fmtopalbums [period] [user]` | `fmtal` | Nobody | Top albums |
| `fmtoptracks [period] [user]` | `fmtt` | Nobody | Top tracks |
| `fmartist [artist]` | `fma` | Nobody | Artist info and your plays |
| `fmalbum [query]` | `fmal` | Nobody | Album info |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Nobody | Community leaderboard for an artist |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Nobody | Community leaderboard for an album |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Nobody | Community leaderboard for a track |
| `fmcrowns [artist]` | `crowns` | Nobody | Artist crowns |
| `fmtaste <user>` | `taste` | Nobody | Compare taste with someone |
| `fmchart [size] [period] [user]` | `chart` | Nobody | Album art collage |
| `ttsenable` | `tts`, `ttson` | Manage Community | Enable TTS in your voice channel |
| `ttsremove` | `ttsoff` | Manage Community | Disable TTS in your voice channel |
| `ttslink [#channel]` | `ttschannel` | Manage Community | Link a text channel to the voice channel |
| `ttsannounce` | `ttsjoinleave` | Manage Community | Toggle join and leave announcements |
| `ttsautojoin` | `ttsauto` | Manage Community | Toggle joining this voice channel automatically |
| `ttsjoinformat [text]` | `ttsjoin` | Manage Community | Join announcement text |
| `ttsleaveformat [text]` | `ttsleave` | Manage Community | Leave announcement text |
| `ttsvolume <0..100>` | `ttsvol` | Manage Community | TTS loudness |
| `ttsspeed <0.5..2>` | | Manage Community | TTS speed |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Manage Community | Community default voice |
| `ttsvoice [voice]` | | Nobody | Your own voice |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Nobody | Browse voices |
| `ttsblock <user>` | `ttsban` | Manage Community | Toggle a member's TTS block |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Manage Community | List blocked members |
| `ttsrole [role]` | | Manage Community | Require a role for TTS |
| `ttsreplycontext` | `ttsreply` | Manage Community | Toggle reply context |
| `ttsattachmentnarration` | `ttsattach` | Manage Community | Toggle attachment narration |
| `ttsconsecutivegrouping` | `ttsgroup` | Manage Community | Toggle name skipping for consecutive messages |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Manage Community | Pending TTS message limit |
| `ttssettings` | `ttsinfo` | Manage Community | Show TTS settings |

## Tips and gotchas

- The bot needs Connect and Speak in the voice channel, and Send Messages in the music channel for notices.
- Most commands check that you are in a voice channel first, and that it is the one the bot is in.
- Volume from `volume` is saved as the community default, so a late night 10 becomes tomorrow's starting volume.
- Spotify playlists are converted track by track through YouTube search, so long playlists take a while and a few matches may be wrong.
- Saved playlists store links, not audio. If a video is removed from YouTube the entry is skipped on load.
- Vote skip counts only humans in the channel. In a channel of one, your own vote is enough.
- TTS only reads messages from members who are in the voice channel, so people watching from text cannot trigger it.
