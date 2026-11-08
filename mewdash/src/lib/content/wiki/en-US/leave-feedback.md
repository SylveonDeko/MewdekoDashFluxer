---
title: Leave Feedback
slug: leave-feedback
summary: Asks a community's owner why they removed the bot and collects the answers on an owner-only page
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner]
related: [invites]
---

## What it does

Every time the bot is kicked from or leaves a community, it sends the community owner a short DM. The DM lists common reasons by number and the owner replies in the same DM. Answering is optional and the DM says so.

Each answer is stored with the community's name, its member count, its owner and how long the bot had been in it. If a report channel is set, a summary embed is posted there as well, and it is updated if the owner adds a comment later.

This is a bot-level feature. There is no per-community setting, and the dashboard page only appears for the bot owner.

> [!NOTE]
> Only the bot owner can see the Leave Feedback page. Other dashboard users do not get it in the sidebar and cannot open it.

## Why you would use it

- Learn why communities leave, whether it is a missing feature or a setup or reliability problem.
- Spot communities that only added the bot to test it, so their departures can be ignored.
- Reach out to owners who wrote a comment and left contact details.
- Track how often owners bother to answer at all.

## The prompt

The DM is titled "Sorry to see me go!" and explains that the bot was just removed from the named community. It lists these reasons, numbered in this order:

| Reason key | Shown to the owner |
| --- | --- |
| `not_needed` | We didn't need it anymore |
| `confusing` | Too confusing to set up |
| `missing_features` | Missing features we wanted |
| `unreliable` | It was broken or unreliable |
| `other_bot` | We switched to another bot |
| `temporary` | Temporary, I'm adding it back |
| `testing` | Just testing something |

The owner replies to the DM with the number of a reason, and can add a comment after it, such as `2 the setup was hard`. A reply that does not start with a number is saved as a comment. Replying `skip` marks the record dismissed and it is never reported.

Rules that keep this from being annoying:

- A community is asked at most once every thirty days, however many times it adds and removes the bot.
- A reply only counts within seven days of the DM.
- If the owner's DMs are closed, nothing is stored.
- Nothing is sent when the feature is switched off.

## Statuses

Each record ends up in one of three states, which the dashboard filters on.

| Status | Meaning |
| --- | --- |
| Answered | The owner picked a reason or wrote a comment |
| Dismissed | The owner replied `skip` |
| No response | The DM was sent and nothing came back yet |

## Settings

The page has two tabs, **Responses** and **Settings**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Ask owners why the bot was removed | on | Whether the DM is sent at all |
| Report channel ID | empty | Channel that receives a summary embed per answer. Empty falls back to the bot's join/leave log channel. |

Below the channel field the page shows which channel and community the ID resolves to and whether the bot can reach it.

The **Responses** tab has six counters, **Prompts sent**, **Answered**, **With a comment**, **Dismissed**, **No response** and **Response rate**, a **Reasons given** breakdown, and a table with columns **Left**, **Community**, **Reason** and **Status**. You can filter by reason and status (the status filter also has a **Left a comment** option), search by community name or comment text, use **Show comment** and **Hide comment** on a row to read the full comment, and delete a record after confirmation. The table shows 50 records per page, and on narrow screens each record is a card instead of a table row. **Response rate** counts answered and dismissed prompts together.

## Setup walkthrough

1. Log in to the dashboard with the bot owner's account and open **Leave Feedback**.
2. On the **Settings** tab, check that **Ask owners why the bot was removed** is on. It is on by default.
3. Paste a channel ID into **Report channel ID** and click **Save channel**, or leave it empty to use the join/leave channel.
4. Remove the bot from a test community you own and reply to the DM.
5. Check the **Responses** tab and the report channel for the entry.

## Commands

This feature is dashboard only. There are no bot commands; owners answer by replying in the DM.

## Tips and gotchas

- The bot only DMs the person Fluxer lists as the community owner, not whoever kicked it.
- The thirty day cooldown is per community, so a community that re-adds the bot and removes it again inside that window is not asked twice.
- The summary embed goes to the configured channel, or to the join/leave log channel from the bot's credentials when none is set. If neither exists, answers are still stored and visible on the page.
- Deleting a record from the dashboard does not delete the embed already posted in the report channel.
