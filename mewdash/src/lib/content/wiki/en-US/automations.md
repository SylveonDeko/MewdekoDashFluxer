---
title: Automations
slug: automations
summary: Build rules that run a list of actions when something happens, like a member joining
icon: fa-wand-magic
category: Actions
dashboard: /dashboard/automations
module: Automations
tags: [automations, triggers, actions, conditions, rules, workflows, no code, templates, cooldown]
related: [chat-triggers, roles, multigreets]
---

## What it does

An automation is one rule made of a trigger and an ordered list of actions, with optional conditions in between. When the trigger happens and every condition passes, the bot runs the actions one after another.

The Automations page, described on the dashboard as running actions when something happens, has two cards. **Your automations** lists every rule with its trigger, how many conditions and actions it has, a switch and a delete button. **Templates** creates ready-made rules. There is no limit on how many automations a community can have.

## Create an automation

1. Click **New automation**.
2. Enter a **Name**, up to 100 characters.
3. Under **Trigger**, choose what it **Starts when**.
4. Optionally click **Add a condition**.
5. Click **Add an action** for each step.
6. Adjust **Settings**, then click **Create**.

If something is missing, **Fix these first** lists what to correct. Once created, the automation is open for editing with a **Enabled** switch and changes save as you make them. Changing the trigger removes conditions and actions that do not fit it, and tells you how many.

## Triggers

| Trigger | Starts when |
| --- | --- |
| Message sent | A member sends a message |
| Message edited | A member edits a message |
| Message deleted | A message is deleted |
| Reaction added | A member adds a reaction |
| Reaction removed | A member removes a reaction |
| Member joined | A member joins the community |
| Member left | A member leaves the community |
| Role gained | A member gains a role |
| Role lost | A member loses a role |
| Voice joined | A member joins a voice channel |
| Voice left | A member leaves a voice channel |
| Thread created | A thread is created |

## Conditions

All conditions have to pass, and an automation can have up to 25. Only the ones that fit the trigger are offered, so a message condition is not available on a member trigger.

| Condition | Checks |
| --- | --- |
| In channels | The channel of the event |
| From specific members | Who caused it |
| Has any of the roles, Has all roles, Has none of the roles, Lacks one of the roles | The member's roles |
| Message contains, Message does not contain, Message equals | The message text. **Match letter case** is optional |
| Message matches a pattern | A regular expression of up to 200 characters |
| Has text, Has an attachment | What the message carries |
| Is a reply, Is not a reply | Whether the message replies to another |
| Reaction is one of | The emoji used |
| Reaction count | **Compare** with Equal to, At least or At most a **Count** |
| Role is one of | The role gained or lost |

Lists such as roles, members and emojis hold up to 25 items.

## Actions

Actions run in the order you set, up to 15 per automation. Use the arrows to move one up or down and the cross to remove it.

| Action | What it does |
| --- | --- |
| Send a message | Posts in a **Channel**, or the channel of the event |
| Send a DM | Messages **Who it affects**: Member who started it or Message author |
| Reply to the message | Replies, with **Ping the author** optional |
| Repost the message | Copies the message to another channel, with **Link to the original** optional |
| Delete the message | Deletes the message |
| Pin the message | Pins the message |
| Add reactions | Adds up to the listed **Emojis** |
| Remove the reaction | Removes the reaction that started the run |
| Give roles, Take roles | Changes **Roles** |
| Create a thread | Starts a thread, from the message if **Start from the message** is on. **Archive after** is One hour, One day, Three days or One week |
| Send in the thread | Posts in the thread |
| Add members to the thread | Adds **Members**, and **Also add the member who started it** |
| Give coins, Take coins, Give XP, Take XP | Changes an **Amount**, up to 100,000,000 |
| Wait | Pauses for **Seconds**, up to 60. A run can wait 120 seconds in total |

Messages work like the rest of the dashboard: plain text or embeds, with placeholders. Text is limited to 2000 characters and an embed to 8000. The editor lists the extra placeholders each trigger provides, such as the message text or the reaction emoji.

## Settings

| Setting | What it does |
| --- | --- |
| Cooldown in seconds | Time before it can run again. 0 means none, up to 86400 |
| Cooldown applies to | Member or Channel. Shown once a cooldown is set |
| Ignore bots | Skips events caused by bots. On by default |
| Retry when Fluxer is busy | Tries an action again, up to 3 times, after a rate limit or a temporary error |
| Allow @everyone, @here and role mentions | Lets messages use those mentions |

An automation runs at most 30 times a minute, so a busy channel cannot flood the community.

## Templates

Pick a template, fill in what it asks for, such as a channel or a role, then click **Create**. The automation is added to the list.

| Template | What it does |
| --- | --- |
| Welcome message | Welcomes each new member |
| Thread joiner | Adds a member to every new thread |
| Starboard repost | Reposts messages that get three star reactions |

## Test and log

Open an automation to find **Test and log**. Under **Run as** choose a member, optionally choose **Run in** a channel, then click **Run test**. A test ignores the conditions and the cooldown, and appears in the log with a **Test** badge.

**Latest runs** keeps the latest 50. Each shows Succeeded or Failed and how long it took in milliseconds. The time it ran sits beside it. A failed run says which action failed and why. **Refresh runs** reloads the list.

## Commands

| Command | Aliases | Purpose |
| --- | --- | --- |
| `automations` | | List the automations |
| `automationshow <id>` | | Show the trigger, conditions, actions and settings |
| `automationenable <id>` | | Turn an automation on |
| `automationdisable <id>` | | Turn an automation off |
| `automationdelete <id>` | | Delete an automation |
| `automationtest <id>` | | Run an automation once as yourself |
| `automationlog <id>` | | Show the latest runs |
| `automationtemplates` | | List the templates |
| `automationtemplate <template> [mentions]` | | Create automations from a template |

All of them need the Manage Community permission. Building and editing happens on the dashboard.
