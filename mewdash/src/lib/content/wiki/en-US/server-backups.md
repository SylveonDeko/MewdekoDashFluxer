---
title: Community Backups
slug: server-backups
summary: Back up your community's layout and settings so you can restore them later
icon: fa-box-archive
category: Actions
dashboard: /dashboard/administration?tab=backups
module: Administration
tags: [backup, restore, template, community template, roles, channels, emoji, clone community, disaster recovery]
related: [administration, servermanagement, channel-tools]
---

## What it does

A backup is a copy of a community's settings, roles, categories, channels, permission overwrites and emoji. It can also hold the most recent messages of channels you pick. Backups belong to you, not to the community, so you can restore one into a different community you own or administrate.

A template is the same idea cut down to the layout. It has no emoji or messages, and none of the community settings. The bot comes with starter templates for community, gaming and support communities.

Open the **Backups** tab of the **Administration** page, or use the backup and template commands listed below. The tab has three cards: **Back up this community**, **Your backups** and **Templates**.

## Back up this community

1. Set **Recent messages to save per channel**, from 0 to 100. Leave it at 0 to skip messages.
2. If it is above 0, pick the text channels in **Channels to save messages from**. Only the first 10 are used.
3. Press **Create backup**.

The button is disabled while you are at your backup limit. The line under it shows how many backups you have used and the time you have to wait between backups.

## Your backups

Each row shows the backup number, the community it came from, when it was made, its size, and badges for roles, channels, emoji and messages. Open a row to preview the roles and channels inside it. Use the trash button to delete it. Delete asks for confirmation and can't be undone.

In the preview, **Restore into** the selected community using one of two modes:

- **Add what's missing** only creates what the backup holds and the community doesn't have yet.
- **Replace everything** deletes everything the backup covers first, then recreates it from the backup. It can't be undone.

Press **Restore** and confirm. A restore runs in the background and the tab shows its progress (**Restoring**, then **Restore finished** with a count of failed or skipped items). When it ends, the bot sends a summary to your direct messages, or to a restored channel if your messages are closed.

### Limits

| Limit | Value |
| --- | --- |
| Backups per person | 5 |
| Size of one backup | 25 MB compressed |
| Time between backups | 30 minutes |
| Messages saved per channel | 100 |
| Channels to save messages from | 10 |

There is no limit on templates.

## Who can use it

You must own the community or have the Administrator permission, both to create a backup and to restore one. Restoring a backup of another community also needs you to be an administrator there while the bot is in that community. The bot needs Manage Roles, Manage Channels, Manage Community and Manage Expressions, plus Manage Webhooks to restore messages, and its highest role must sit above the roles it creates.

## Templates

The **Templates** card lists the starter templates (Community, Gaming, Support) and your saved ones. Type a **Template name** (up to 50 characters) and press **Save as template**. Using an existing name asks before replacing your template. Open a row to preview it. **Apply** only adds the roles and channels the community is missing and never deletes anything. Starter templates can't be deleted.

## Commands

Run these with your community's prefix (`.` unless you changed it). You need to own the community or have Administrator for the backup commands and the template save and apply commands.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `backupcreate [messages] [#channels]` | `bkcreate` | Back up this community. With a message count and no channels, the current channel is used. |
| `backuplist` | `bklist` | List your backups |
| `backupinfo <id>` | `bkinfo` | Show what a backup holds |
| `backuprestore <id> [replace\|add]` | `bkrestore` | Restore a backup into this community after a confirmation. Defaults to `replace`. |
| `backupdelete <id>` | `bkdelete` | Delete a backup |
| `templatesave <name>` | `tmplsave` | Save this community as a template |
| `templatelist` | `tmpllist` | List starter and saved templates |
| `templateapply <name>` | `tmplapply` | Add a template's missing roles and channels |
| `templatedelete <name>` | `tmpldelete` | Delete a saved template |
