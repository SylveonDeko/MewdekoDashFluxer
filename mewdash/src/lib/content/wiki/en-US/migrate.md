---
title: Move from Discord
slug: migrate
summary: Bring your Mewdeko settings from a Discord server to this Fluxer server, and let your members carry over their own XP, balance and warnings.
icon: fa-arrow-right-arrow-left
category: Settings
dashboard: /dashboard/migrate
module: Migration
tags: [migrate, migration, move, discord, import, transfer, switch, link, link discord, export, xp, balance, warnings]
related: [settings, xp, currency, access]
---

## What it does

If your community used Mewdeko on Discord, you do not have to set everything up again. The dashboard reads your Discord server's Mewdeko setup, pairs its channels and roles with the ones in your Fluxer server, and writes the settings over. Members then bring their own data across from their profile page.

Everything happens in the dashboard and the setup wizard. You never type a command, and nothing is changed on Discord.

## Why you would use it

- Keep your greetings, logging, XP rewards, filters and the rest of your configuration instead of rebuilding them.
- Keep your members' progress. XP, balances, warnings and similar data wait for each member until they link their Discord account.
- Check the channel and role pairs before anything is written.

## Who can use it

Server administrators of the Fluxer server. You also need to own the Discord server or have Administrator there, and Mewdeko must be in it.

> [!PERMISSION]
> To prove who you are on Discord, the dashboard asks you to sign in with Discord. It only asks for your account name and the list of servers you are in, and it keeps the result for 15 minutes before forgetting it. The Discord access token is thrown away as soon as the sign in finishes.

## Moving a server

1. Open **Move from Discord** in the dashboard, or take the **Coming from Discord?** step in the setup wizard.
2. Press **Connect Discord** and approve the sign in.
3. Pick the Discord server to move. If a server has more than one Mewdeko in it, each one is listed with its name and avatar, so pick the one whose data you want.
4. Wait while the export is read. Large servers can take up to a minute.
5. Review the preview: how many features, settings and members will come over, and the channel and role pairs.
6. Fix any pair that was not matched. Unmatched channels and roles are highlighted. Choose the right one from the list next to it and the preview updates.
7. Read the warning, tick the box and confirm.

> [!NOTE]
> An export stays available for 24 hours. If it expires, start again from step 3.

## What gets replaced

> [!TIP]
> Moving replaces the current Mewdeko settings of this server for every feature that is in the Discord export. Features that are not in the export are left alone. Data your members already have on Fluxer is kept, and the moved data is added to it.

After the move you see how many entries were written, held for members who have not linked yet, dropped, or failed, and how many messages were posted again.

## Moving again

Once a server has been moved, the page shows when it happened and how many members are still waiting to link their Discord account. You can move again at any time, for example after fixing a pairing.

## Bringing over your own data

Every member does this once, from their profile page:

1. Open **My Settings** and find **Link Discord**.
2. Press **Link Discord** and sign in with Discord.
3. Press **Bring over my data**.

The page tells you how many entries came over and from how many servers. A Discord account can only be linked to one Fluxer account. If it is already linked to a different one, you see a message saying so and nothing is changed.

## Tips and gotchas

- Create your channels and roles in the Fluxer server first. The pairing is much more complete when they already exist.
- Pairing is by name first. Rename a channel or pick the pair by hand when the names differ.
- Data for members who have not linked is held safely and arrives as soon as they link.
