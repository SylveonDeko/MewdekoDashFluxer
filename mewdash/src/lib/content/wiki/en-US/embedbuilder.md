---
title: Embeds
slug: embedbuilder
summary: Design embed messages and keep them as templates you can send to any channel
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, link buttons, custom message]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## What it does

The embed builder is a visual editor for Fluxer messages. You fill in a title, description, colour, fields and images while a live preview updates, and you get a block of JSON at the end. That JSON is the bot's universal message format. Paste it into `say` to post it or save it as a named template, or drop it into any feature that takes a custom message, such as greets, chat triggers, AFK replies, feed updates, or the giveaway winner DM.

Templates can be personal, visible only to you across every community, or shared with a community so any staff member can load them. The dashboard can also send a finished message straight to a channel, optionally through a webhook with a custom name and avatar, called a persona.

Members never interact with the builder. They just see the messages it produces.

## Why you would use it

- Write a rules or info post with proper formatting and update it later with `edit`.
- Design a welcome message once, then paste the JSON into greets.
- Keep a set of announcement templates so staff post consistent-looking updates.
- Add link buttons that point at your rules page or website.
- Post as "Community News" with its own avatar without giving anyone webhook access.

## The JSON format

The parser looks for the first `{` in the text and reads up to its matching `}`. If there is no JSON object, or it does not parse, the whole text is treated as plain content. Property names are case insensitive.

| Key | Type | Meaning |
| --- | --- | --- |
| `content` | string | Plain text shown above the embeds |
| `embed` | object | A single embed. If present, `embeds` is ignored. |
| `embeds` | array | Up to ten embed objects |
| `components` | array | Link buttons only |

An embed object accepts `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`), and `fields` (array of `name`, `value`, `inline`). `color` can be a number or a string such as `#5865F2`. Field names are cut to 256 characters and values to 1024. Any URL that is not a full absolute address is dropped rather than failing the whole message. A `timestamp` key is accepted but not shown.

Fluxer has no message buttons, so a component with a `url` is added to the message text as a markdown link, using its `displayName`. Components without a `url` are not sent.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Placeholders

The builder's **%** button inserts placeholders from the placeholders page (user, community, channel, bot, time, and so on). The dashboard does not replace them: a message sent from the **Send** tab goes out with the literal text. The bot replaces them when JSON passes through a command or feature, for example `say`, `embedpreview`, greets, and triggers. Each feature adds its own set, such as `%afk.message%` or `%giveawayitem%`, on top of the general ones.

Placeholders that resolve to an image or GIF, such as `%user.avatar%`, `%server.icon%`, `%bot.avatar%`, banners and the `%...gif%` ones, only show as a link in text. When one lands in a text field, a chip offers **Move to thumbnail** or **Move to image**. The thumbnail, image and icon URL fields have their own **%** button.

## Templates

A template is a name plus the JSON. Two scopes exist.

| Scope | Who sees it | Created by |
| --- | --- | --- |
| Personal | Only you, in any community and in DMs | `embedsave`, or **Save** on the dashboard with sharing off |
| Community shared | Anyone with access in that community | `guildembedsave` (Manage Messages), or **Save** with **Share with everyone on this community** on |

Names must be unique within a scope. `embedpreview <name>` looks up your personal template first, then the community's shared one, replaces placeholders, and posts it in the current channel.

Some commands accept a template reference in place of raw JSON: write `{template:name}` or `{t:name}` as the message. `multigreetmessage` supports this. The resolved JSON is stored, not the reference, so later edits to the template do not update the greet.

## The dashboard page

The page is titled **Fluxer Embed Builder** and has six tabs. On wide screens the **Live preview** and the **Issues** list sit beside the tab. **Undo**, **Redo**, **Cancel edits**, and **Copy JSON** sit in the page header. **Copy JSON** stays disabled until there is a title, description, field, or message content. The open tab is kept in the URL as `?tab=`.

| Tab | What you do there |
| --- | --- |
| Templates | **Choose a template** from a gallery, filtered by category (All templates, Information, Fun, Interactive and others), or press **Start from scratch** |
| Editor | **Message content (optional)** plus **Embeds (n/10)** with **Add embed**. Each embed can be duplicated or removed and has four sections: **Content**, **Appearance**, **Fields** (up to 25) and **Media**. |
| Components | **Add row**, then add link buttons to a row. Drag the handle to reorder rows. Rows can be duplicated or removed. Only buttons with a URL are sent. |
| JSON | The **Raw JSON** payload. **Refresh from builder** regenerates it and **Apply to builder** loads pasted JSON, either a full payload or a single embed object. |
| Saved | **Save current embed** with a name and **Share with everyone on this community**, then **Shared on this community** and **My embeds** lists with **Load**, **Overwrite** (replaces the saved embed with the builder's current state) and **Delete** |
| Send | Choose a channel, review your permissions there, optionally send through a webhook as a persona or with a custom name and avatar URL, then **Send message** |

### Embed sections

| Section | Contains |
| --- | --- |
| Content | Title, title URL and description |
| Appearance | **Embed color** from a preset list (Brand green, Fuchsia, Orange, Purple, Yellow, White, Black and others) or a custom hex value, plus the author (name, URL, icon) and the footer (text, icon) |
| Fields | Name, value and **Display inline (up to 3 fields per row)** for each field |
| Media | **Thumbnail URL** and image URL, with tips on formats (PNG, JPG, GIF, WebP) and the 8MB image size |

The editor checks as you type. Problems that would make a message fail, such as a title over 256 characters, a description over 4096, a field without both name and value, an author with an icon but no name, or an empty embed, show in **Issues** and block sending.

### Components

Give each button a label and a URL. The bot turns each one into a link in the message text. Fluxer has no message buttons or select menus, so the builder only offers link buttons. JSON with other component types is ignored when you apply it.

### Sending and personas

The **Send** tab is titled **Send to** followed by the community name. It only lists channels where both you and the bot can post, and shows **Your permissions in #channel** for sending embeds and mentioning everyone and roles. Sending embeds needs Embed Links for both. If you lack Mention Everyone, everyone, here, and role mentions are stripped and the tab warns you. A confirmation shows before each send.

To send through a webhook, tick **Send through a webhook with a custom name and avatar**. This needs Manage Webhooks for you and the bot. Under **Send as**, pick a persona or **Custom**. **Custom** takes a **Webhook display name (optional)** and **Webhook avatar URL (optional)** for that send only.

A **persona** is a saved name and avatar, personal or shared with the community. The manage button opens **Send as personas**, where **New persona** takes a name (up to 80 characters), an avatar by **Choose an image** or **Link**, and a **Share with everyone in** the community switch. Uploaded avatars are PNG, JPG or GIF up to 8MB and use one webhook per channel the persona posts in, so a channel can hold at most fifteen. A linked avatar does not use one. Every send is recorded in the dashboard audit log.

The same builder opens as a popup inside other dashboard pages (such as greets and triggers) with the **Editor**, **Components**, **JSON**, and **Saved** tabs only.

## Settings

The builder has no community settings. Everything is per message or per template.

## Setup walkthrough

1. Open **Embeds** in the dashboard and pick a template or press **Start from scratch**.
2. In **Editor**, write the content and fill in the embed. Watch **Issues** for anything that would make the message fail.
3. Add link buttons in **Components** if you need them.
4. Go to **Saved**, give it a name, turn on **Share with everyone on this community** if staff should use it, and press **Save**.
5. To post it now, open **Send**, pick a channel, and press **Send message**. To use it elsewhere, press **Copy JSON** and paste it into the other feature.
6. In Fluxer, `.embedpreview <name>` posts a saved template with placeholders filled in.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Manage Messages | Post text or embed JSON as the bot, with placeholders replaced. A `.txt` attachment can supply the message. |
| `edit #channel <message id> <text or JSON>` | | Manage Messages | Replace the content of a message the bot sent |
| `embedsave <name> <JSON>` | `esave` | Nobody | Save a personal template |
| `embedlist` | `elist` | Nobody | List your personal templates |
| `embeddelete <name>` | `edel`, `edelete` | Nobody | Delete one of your personal templates |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Manage Messages | Save a template shared with this community |
| `guildembedlist` | `gelist`, `gembedlist` | Nobody | List the community's shared templates |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Manage Messages | Delete a shared template |
| `embedpreview <name>` | `epreview`, `eprev` | Nobody | Post a saved template in the current channel |

## Tips and gotchas

- `say` mirrors your own mention rights: without Mention Everyone the bot will not ping everyone or roles for you.
- An embed with only a title and nothing else is still sent, but the dashboard will not let you copy or send until there is a title, description, field, or content.
- Buttons are sent as plain links, so they look like part of the message text rather than clickable buttons.
- Malformed image, thumbnail, author, and footer URLs are silently dropped. If an image is missing, check that the URL starts with `https://`.
- The builder allows up to ten embeds per message and 25 fields per embed.
- Deleting a persona does not remove the webhooks it created in channels. Clean those up in the channel's integrations settings if needed.
