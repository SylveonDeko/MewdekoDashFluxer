---
title: Help and Commands
slug: help
summary: How to find the bot's commands and learn what they do from inside Fluxer
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, prefix, setup wizard, guide, source, donate, vote]
related: [permissions, administration, userprofile]
---

## What it does

The Help module is how members discover what the bot can do. `help` (or `cmds`) posts a menu that lists the command categories and the modules in each. `commands <module>` lists the commands of one module ten per page with short descriptions, or, for very large modules, an overview of its sections first.

`help <command>` shows a single command: its name and first alias, what it does, the permissions it needs from you and from the bot, and a cooldown if it has one. It also lists each parameter, alternative forms, usage examples and a link to the documentation.

`searchcommand <term>` finds commands whose name or description contains the term. Mentioning the bot with no text replies with the current prefix and a pointer to `cmds`.

Every command is a text command, used with the community prefix. The bot has no slash commands.

## Why you would use it

- A new member types `.help` and needs somewhere sensible to land.
- Staff want to know exactly which permission a command needs before granting it.
- Someone remembers half a command name and wants to search for it.
- You just invited the bot and want a guided setup instead of reading every module's docs.

## The help menu

`help`, `commands` or `modules` with no arguments posts the top level. The embed's description explains the two ways in: `cmds <module>` for a module, or `h commandname` for one command. It also carries links to the documentation, support community, invite and donation pages.

| Category | Contains |
| --- | --- |
| Moderation & Admin | Administration, Moderation, Permissions, Community Management, Role States, Status Roles, Counting Moderation |
| Community Setup | MultiGreets, Role Greets, Starboard, Bridge, Stat Channels, Server Stats, Live Boards, Stat Roles, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Role Menus, Polls, Giveaways, Twitch, Migration |
| Fun & Games | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economy & Levels | Currency, XP, Reputation, Achievements, Vote, Patreon |
| Music | Music |
| Utility | Utility, Help, AFK, Todo, User Profile, Birthday, Word of the Day, Highlights, Copr Monitoring |
| Bot Owner | Owner-only modules |
| Other | Anything not filed above |

Each module is shown in bold. A module that is struck through is disabled for you in the current channel, either by a permission rule or because the bot owners have disabled it everywhere.

### Module pages

`commands <module>` jumps straight to a module. The name can be exact or a unique prefix, so `cmds mod` opens Moderation while `cmds s` complains that several modules match. Add a word after the module to filter: `cmds utility remind` lists only commands in Utility whose name or description mentions "remind". Use `all` to list every command in the module.

Modules with more than 30 commands and at least three sections show an overview first: the module description and one field per section with its command count. Open a section by name, for example `cmds <module> <section>`. Smaller modules go straight to the paged list. Pages hold ten commands grouped by section and are controlled with reactions. The paginator stays active for an hour.

## Command pages

`help <command>` matches the exact name or any alias. The embed contains:

- The command with its prefix and first alias, and its description.
- **User Permissions**: what you need. When a permission override from the Administration module replaces the built-in requirement, the original is shown struck through and the override is listed after it.
- **Bot Permissions**: what the bot needs, when the command has requirements.
- **Documentation**: a link to the command's page on the docs site.
- **Cooldown**: shown only when the command has one.
- **Parameters**, **Overloads** and **Usage** from the command documentation, listing each argument, whether it is optional and any default.
- A footer with the module, submodule and method name, useful when reporting bugs.

## When the bot joins

When the bot is added to a community it finds who invited it from the audit log (it needs View Audit Log for this) and DMs them. The message links to the dashboard setup wizard for that community and to the support community, with a three-step reminder of `cmds`, `cmds mod` and `h purge`. If the inviter cannot be identified or has DMs closed, nothing is sent; there is no channel announcement. The bot owner can turn the welcome DM off.

## The setup wizard

The wizard lives at `/wizard?guild=<id>` on the dashboard. The link in the welcome DM opens the quick setup flavour; the dashboard itself can offer the first-time flavour, which adds a permissions check at the start.

| Step | What it does |
| --- | --- |
| Welcome | Explains what is about to happen |
| Permissions | First-time only: checks the bot has what it needs |
| Community basics | Prefix, bot language, and community timezone. Leave the prefix blank to keep the default. |
| Bring your data | Move your setup over from Discord. Skip it if you are starting fresh. |
| Select features | The features suggested for your community, based on its size and layout, which you can adjust or browse in full. Each is set to **Full setup**, **Quick enable** or **Skip**. |
| One step per full-setup feature | Guided configuration for that feature |
| Quick setup | Pick the basic channels for the quick-enabled features and enable them with their defaults |
| Complete | Summary, including anything that failed to save |

Progress is stored per community, so leaving and coming back resumes. A community can be marked skipped so the wizard stops offering itself, and the **My Settings** page has a toggle for whether you prefer guided setup and a reset for a community's wizard state.

## Settings

There is nothing to configure for help itself. The prefix is set with the Administration module and shown in every help embed. It defaults to `.`.

## Setup walkthrough

1. Run `.help` to see how modules are grouped.
2. Run `.cmds mod` to see the Moderation module, then `.h purge` to see one command in full.
3. Run `.searchcommand role` to see how search narrows things down.
4. If you have just invited the bot, follow the setup link from the welcome DM, or open `/wizard?guild=<your community id>` on the dashboard.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `help [command]` | `h` | Nobody | Help menu, or help for one command |
| `commands [module] [term]` | `cmds` | Nobody | Module list, one module's commands, or a filtered list |
| `modules` | `mdls` | Nobody | The same top-level menu as `help` |
| `searchcommand <term>` | | Nobody | Search command names and descriptions, up to 20 results |
| `guide` | `readme` | Nobody | Link to the getting started guide |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Nobody | Link to the source code |
| `donate` | | Nobody | How to support the bot |
| `vote` | | Nobody | Link to vote for the bot |
| `exportcommandsjson` | `exportcommands`, `excj` | Nobody | Export every command as a JSON file (once a minute) |

## Tips and gotchas

- If `help` shows a module struck through for you, a permission rule or the bot owners have disabled it in that channel. Ask staff to check `listperms`.
- Help pages reflect the real preconditions on the command, so a permission listed there is authoritative even if the docs site lags behind.
- Module matching by prefix means short prefixes are often ambiguous; use at least three or four letters.
- The bot only DMs the inviter on join. If you invited it from a shared link and got nothing, open the wizard from the dashboard instead.
