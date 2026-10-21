---
title: Embeds
slug: embedbuilder
summary: Build rich messages with embeds and link buttons, save them as templates, send them to a channel, and reuse the same JSON anywhere the bot accepts a custom message.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, custom message]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## What it does

The embed builder is a visual editor for Discord messages. You fill in a title, description, colour, fields, images, and optional link buttons, watch a live preview, and get a block of JSON at the end. That JSON is the bot's universal message format. Paste it into `say` to post it, save it as a named template, or drop it into any feature that takes a custom message, such as greets, chat triggers, AFK replies, feed updates, or the giveaway winner DM.

Templates can be personal, visible only to you across every server, or shared with a server so any staff member can load them. The dashboard can also send a finished message straight to a channel, optionally through a webhook with a custom name and avatar, called a persona.

Members never interact with the builder. They just see the messages it produces.

## Why you would use it

- Write a rules or info post with proper formatting and update it later with `edit`.
- Design a welcome message once, then paste the JSON into greets.
- Keep a set of announcement templates so staff post consistent-looking updates.
- Add links under the message as link buttons.
- Post as "Server News" with its own avatar without giving anyone webhook access.

## The JSON format

The parser looks for the first `{` in the text and reads up to its matching `}`. If there is no JSON object, or it does not parse, the whole text is treated as plain content. Property names are case insensitive.

| Key | Type | Meaning |
| --- | --- | --- |
| `content` | string | Plain text shown above the embeds |
| `embed` | object | A single embed. If present, `embeds` is ignored. |
| `embeds` | array | Up to ten embed objects |
| `components` | array | Link buttons, shown as links under the message |

An embed object accepts `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`), and `fields` (array of `name`, `value`, `inline`). `color` can be a number or a string such as `#5865F2`. Field names are cut to 256 characters and values to 1024. Any URL that is not a full absolute address is dropped rather than failing the whole message. A `timestamp` key is accepted but not shown.

A component is a link button with `displayName`, `url` and an optional `emoji`. Fluxer messages cannot carry buttons, so the bot adds each one under the message as a link, ordered by `row`. Entries without a `url` are ignored.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Placeholders

The builder's **%** button inserts placeholders from the placeholders page (user, server, channel, bot, time, and so on). The dashboard does not replace them: a message sent from the **Send** tab goes out with the literal text. The bot replaces them when JSON passes through a command or feature, for example `say`, `embedpreview`, greets, and triggers. Each feature adds its own set, such as `%afk.message%` or `%giveawayitem%`, on top of the general ones.

## Templates

A template is a name plus the JSON. Two scopes exist.

| Scope | Who sees it | Created by |
| --- | --- | --- |
| Personal | Only you, in any server and in DMs | `embedsave`, or **Save** on the dashboard with sharing unticked |
| Guild shared | Anyone with access in that server | `guildembedsave` (Manage Messages), or **Save** with **Share with everyone in (server)** ticked |

Names must be unique within a scope. `embedpreview <name>` looks up your personal template first, then the server's shared one, replaces placeholders, and posts it in the current channel.

Some commands accept a template reference in place of raw JSON: write `{template:name}` or `{t:name}` as the message. `multigreetmessage` supports this. The resolved JSON is stored, not the reference, so later edits to the template do not update the greet.

## The dashboard page

The page is titled **Discord Embed Builder** and has six tabs, with a **Live Preview** and an **Issues** panel alongside. **Undo**, **Redo**, **Cancel edits**, and **Copy JSON** sit in the header.

| Tab | What you do there |
| --- | --- |
| Templates | Pick from a gallery of starting points or **Start from Scratch** |
| Editor | **Message Content** plus up to ten embeds. Each embed has title, description, URL, colour, author, footer, up to 25 fields, thumbnail, and image, with character counters. |
| Link buttons | Up to 25 link buttons, each with text, an optional emoji and a URL. The bot shows them as links under the message. |
| JSON | The raw payload. **Refresh from Builder** regenerates it; **Apply to Builder** loads pasted JSON, either a full payload or a single embed object. |
| Saved | **Save Current Embed** with a name and the share checkbox, then lists of **Shared in (server)** and **My Embeds** with **Load** and **Delete** |
| Send | Choose a channel, review your permissions there, optionally send through a webhook as a persona or with a custom name and avatar URL, then **Send Message** |

### Sending and personas

The **Send** tab only lists channels where both you and the bot can post. Sending embeds needs Embed Links for both. If you lack Mention Everyone, everyone, here, and role mentions are stripped and the tab warns you.

Webhook sending needs Manage Webhooks for you and the bot. A **persona** is a saved name and avatar, personal or shared with the server; **Manage** opens the persona list. Personas with an uploaded image get their own webhook in each channel, so a channel can hold at most fifteen of them. The **Custom** option takes a display name and an avatar link instead. Every send is written to the dashboard audit log.

The same builder opens as a popup inside other dashboard pages (greets, triggers, and others) with the **Editor**, **Link buttons**, **JSON**, and **Saved** tabs only.

## Settings

The builder has no server settings. Everything is per message or per template.

## Setup walkthrough

1. Open **Embeds** in the dashboard and pick a template or **Start from Scratch**.
2. In **Editor**, write the content and fill in the embed. Watch the **Issues** panel for anything Discord would reject.
3. Add link buttons in **Link buttons** if you want clickable links under the message.
4. Go to **Saved**, give it a name, tick **Share with everyone in (server)** if staff should use it, and press **Save**.
5. To post it now, open **Send**, pick a channel, and press **Send Message**. To use it elsewhere, press **Copy JSON** and paste it into the other feature.
6. In Discord, `embedpreview <name>` posts a saved template with placeholders filled in.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Manage Messages | Post text or embed JSON as the bot, with placeholders replaced. A `.txt` attachment can supply the message. |
| `edit #channel <message id> <text or JSON>` | | Manage Messages | Replace the content of a message the bot sent |
| `embedsave <name> <JSON>` | `esave` | Nobody | Save a personal template |
| `embedlist` | `elist` | Nobody | List your personal templates |
| `embeddelete <name>` | `edel`, `edelete` | Nobody | Delete one of your personal templates |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Manage Messages | Save a template shared with this server |
| `guildembedlist` | `gelist`, `gembedlist` | Nobody | List the server's shared templates |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Manage Messages | Delete a shared template |
| `embedpreview <name>` | `epreview`, `eprev` | Nobody | Post a saved template in the current channel |

## Tips and gotchas

- `say` mirrors your own mention rights: without Mention Everyone the bot will not ping everyone or roles for you.
- An embed with only a title and nothing else is still sent, but the dashboard will not let you copy or send until there is a title, description, field, or content.
- Malformed image, thumbnail, author, and footer URLs are silently dropped. If an image is missing, check that the URL starts with `https://`.
- A message holds at most ten embeds and 25 fields per embed, and the builder enforces the same numbers.
- Deleting a persona does not remove the webhooks it created in channels. Clean those up in the channel's integrations settings if needed.
