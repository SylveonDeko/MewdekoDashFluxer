---
title: Polls
slug: polls
summary: Post polls that members answer with reactions and schedule them ahead of time
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, reactions]
related: [votes, games]
---

## What it does

Staff post a question with two to twenty options. The bot sends an embed and adds one reaction per option, and members vote by reacting. The embed shows the live count and percentage for each option, and the footer shows the poll ID.

Members can change their vote by reacting to a different option, or remove it by removing their reaction, unless vote changes were switched off for that poll. Reactions on an option that is not part of the poll are removed.

Polls can be closed by hand or expire after a set duration, and they can be scheduled to post at a later date. Templates save a question and its options so the same poll can be posted again with one command.

The dashboard page is a single scrolling page with four cards: **Polls**, **Scheduled polls**, **Templates** and **Analytics**.

## Why you would use it

- Pick a date or a game for the next community event.
- Run a quick yes/no check before a rule change.
- Ask a sensitive question anonymously so nobody can see who voted for what.
- Let only a staff role vote on decisions that concern them.
- Post the same weekly poll every Monday from a template, or schedule it in advance.

## Poll types

| Type | How it votes |
| --- | --- |
| Yes / No | Two fixed options, Yes and No. Created by `poll`. |
| Single choice | One option per member. The default for `pollc`, templates and the dashboard. |
| Multiple choice | Members may pick several options. |
| Anonymous | Votes are stored without showing the voter in stats or exports, and the bot removes each reaction right after counting it. |
| Role restricted | Only members holding one of the allowed roles can vote. Dashboard only. |

Every poll also has these per-poll switches, all on by default: **Allow changing votes**, **Show live results** and **Show progress bars**.

## Voting, closing and expiry

- A vote on a closed or expired poll is rejected and the reaction is removed.
- If vote changes are off, a second vote is rejected as "already voted" and its reaction is removed.
- The poll creator and anyone with Manage Messages can close or delete a poll. Closing rewrites the embed with the final results.
- `pollstats <pollId>` shows total votes and unique voters, and breaks the votes down per option.
- Expiry is checked every five minutes. When a poll expires its message changes to show it expired.
- Scheduled polls are checked every minute. A scheduled poll must be in the future and no more than thirty days away. It can carry a duration in minutes, after which the posted poll expires.

## Templates

A template stores a name and a question with its options. `polltemplate <name>` posts it. `polltemplates` lists them and `polltemplatecreate <name;question;option1;option2;...>` creates one. `polltemplatedelete <name>` deletes one, and so does the dashboard. A template holds at most twenty options.

On the dashboard, the **Templates** card lists each template with its question. Click one, or choose **Use**, to open the new poll sheet pre-filled from it. Choose **Delete** to remove it. Templates are created by ticking **Also save as a template** when posting a poll.

## Settings

Press **New poll** on the **Polls** card to open the sheet.

| Setting | Default | What it controls |
| --- | --- | --- |
| Question | none | The poll title, up to 300 characters |
| Poll type | Single choice | One of the types above |
| Channel | none | Where the poll is posted |
| Options | two blank | Two to twenty options, each up to 100 characters, with **Add option** and a remove button each. Hidden for Yes / No |
| Roles allowed to vote | none | Shown for Role restricted polls, at least one required |
| Roles blocked from voting | none | Members with any of these roles cannot vote |
| Duration (minutes) | Open until closed | 1 to 43200 minutes. Applied when the poll is scheduled |
| Close after votes | no limit | The poll closes once this many members have voted |
| Results message | none | Posted in the channel when the poll ends. Supports `%poll.question%`, `%poll.id%`, `%poll.votes%`, `%poll.voters%`, `%poll.winner%`, `%poll.winner.votes%`, `%poll.results%` and `%poll.link%` |
| Schedule for later | none | A date and time in the future. Leave empty to post now |
| Allow changing votes | on | Whether a member can switch or remove their vote |
| Show live results | on | Whether counts are shown while the poll runs |
| Show progress bars | on | Whether bars are drawn next to counts |
| Also save as a template | off | Saves the question and options under **Template name** |

The submit button reads **Post poll**, or **Schedule poll** once a time is set.

The **Polls** card lists polls with their channel, type, vote count and time left. Turn on **Include closed polls** to see finished ones. Click a poll to open its details: results per option, **Unique voters**, **Participation**, **Peak hour** (in UTC) and **Created**. The buttons there are **Delete**, **CSV** to download the results, and **Close poll** for active polls.

The **Scheduled polls** card lists pending polls with the channel and posting time. The cancel button removes one after a confirmation.

The **Analytics** card shows **Polls this month**, **Votes cast**, **Avg votes per poll** and **Favourite type**, plus a **Polls created per day** chart.

## Setup walkthrough

1. Open **Polls** in the dashboard and press **New poll**.
2. Type the **Question**, pick a **Poll type** and the **Channel**.
3. Fill in the **Options**. Use the remove button to drop extras; at least two are required.
4. For a Role restricted poll, choose the **Roles allowed to vote**.
5. Optionally tick **Also save as a template** and give it a name.
6. Press **Post poll**. If you set **Schedule for later**, press **Schedule poll** and the poll appears in **Scheduled polls**.
7. Watch results on the **Polls** card, then **Close poll** when you are done.

> [!TIP]
> For a quick channel vote you do not need the dashboard. `poll Should we add a movie night?` posts a Yes / No poll in seconds.

## Commands

Run these with your community's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Manage Messages | Post a Yes / No poll |
| `pollc <question;option1;option2;...>` | | Manage Messages | Post a single choice poll |
| `pollm <question;option1;option2;...>` | | Manage Messages | Post a multiple choice poll |
| `polla <question;option1;option2;...>` | | Manage Messages | Post an anonymous poll |
| `pollstats <pollId>` | | Poll creator or Manage Messages | Show the vote counts and timing |
| `pollclose <pollId>` | | Poll creator or Manage Messages | Close a poll now |
| `polldelete <pollId>` | | Poll creator or Manage Messages | Delete a poll, its votes and its message after confirming |
| `pollmaxvotes <pollId> <votes>` | `pmaxvotes` | Poll creator or Manage Messages | Close an open poll after this many votes, or `0` for no limit |
| `pollblockrole <pollId> <role>` | `pblockrole` | Poll creator or Manage Messages | Stop a role from voting, or run it again to allow it |
| `pollresultsmessage <pollId> [message]` | `pollresults`, `presults` | Poll creator or Manage Messages | Set the message posted when the poll ends, or leave it out to clear it |
| `polllist` | `activepolls` | Nobody | List the active polls |
| `polltemplate <name>` | `ptemplate` | Manage Messages | Post a poll from a saved template |
| `polltemplates` | `ptemplates` | Nobody | List the community's templates |
| `polltemplatecreate <name;question;option1;option2;...>` | `ptcreate` | Manage Messages | Save a template |
| `polltemplatedelete <name>` | `ptdelete` | Manage Messages | Delete a template |

## Tips and gotchas

- The bot needs Send Messages, Embed Links and Add Reactions in the poll channel. Anonymous polls also need Manage Messages for the bot, so it can remove reactions.
- Options are split on semicolons, so an option cannot contain one. Options get number emoji automatically.
- Duration is applied by the scheduler. A poll posted immediately stays open until someone closes it, so schedule it for a minute ahead if you need an automatic expiry.
- A closed poll can still be viewed and exported from the dashboard with **Include closed polls** on; a deleted poll is gone.
- Blocked roles and the vote limit are checked at vote time too. A blocked member's reaction is removed.
- Role restricted polls check roles at vote time, so members who lose the role can no longer vote but their earlier vote stays.
