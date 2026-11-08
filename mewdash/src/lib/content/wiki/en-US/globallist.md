---
title: Global List
slug: globallist
summary: A shared list where communities that opt in report harmful users and act on the approved entries
icon: fa-user-xmark
category: Security
dashboard: /dashboard/globallist
module: GlobalList
tags: [global list, global ban, bad users, blocklist, scammers, raiders, spam bots, report user, quarantine, appeals, reviewers, standing]
related: [moderation, automod, logging]
---

## What it does

The global list is a shared record of users that communities reported for harmful behaviour. A community that opts in can report users and can act on the list. Reports are reviewed before they count. Only approved entries are live, and only live entries trigger actions.

Each community decides what happens for every category. When a listed user joins, the bot runs that community's action and posts a line in the log channel saying what it did and why.

The bot stores only the user ID, the category, the reasons, the evidence, the votes, the decisions and the timestamps.

## Turn it on

1. Open **Global list** in the dashboard.
2. Switch on the toggle in the page header. It starts off.
3. Pick an action for each category, a log channel and a quarantine role.

Everything below the toggle is hidden while the list is off. Changes save as you make them.

## Actions

The card **When a listed user joins** has one row per category:

| Category | Used for |
| --- | --- |
| Scamming | Phishing links and other fraud |
| Raiding | Joining to attack a community |
| Spam bot | Accounts that only advertise or flood |
| Harassment | Targeting members |
| NSFW | Adult content where it does not belong |
| Impersonation | Pretending to be a person or a community |
| Something else | Anything that fits none of the above |

Each category takes one action:

| Action | What the bot does |
| --- | --- |
| Ignore | Nothing |
| Alert only | Posts to the log channel |
| Quarantine role | Gives the member the quarantine role |
| Kick | Kicks the member |
| Ban | Bans the member |

Every category starts on **Alert only**. The card also has the **Log channel**, the **Quarantine role** and a switch to act on current members when an entry is approved. With that switch off, the bot only acts when a listed user joins.

The bot never acts on itself, on the community owner or on members whose top role is above its own. It still posts the log line and says why it could not act.

## Reporting a user

**Report a user** opens a form with the user ID, a category, a reason, message links and screenshots. Evidence is required: add at least one message link or one screenshot. A report can carry up to 10 links and 4 screenshots.

Only members with moderation access can report: the community owner, or anyone with Administrator, Manage Community, Ban Members or Kick Members. The same rule applies to voting.

Limits:

- A community can send 20 reports in 24 hours.
- A second report on a user who already has a pending entry joins that entry, so reviewers see one entry with several reports.
- A community can report a user once while the entry is pending.
- A user who is already live cannot be reported again.

## Open reports

The **Open reports** card lists pending entries. Each row shows the user ID, the category and the report and vote counts. A row opens a sheet with every report, its links and screenshots, and the votes so far.

Staff of other opted-in communities can **Confirm** or **Dispute** an entry, with an optional note of up to 200 characters. Each community votes once per entry. A community cannot vote on an entry it reported. Votes are advice for the reviewers and decide nothing.

## Review

Bot owners and appointed reviewers approve or reject pending entries with a note. Owners can also overturn a decision, and can remove a live entry at any time. Owners use the **List review** page under the owner area. Reviewers use the commands below.

The page has four tabs:

- **Review queue** with pending entries and appeals.
- **Live list** with a search by user ID and a way to remove an entry.
- **Reviewers**, where owners appoint and remove reviewers.
- **Reporter standing**, where owners see each community's record and reset it.

When an entry is approved, communities with the existing members switch on also run the action on that user if they are already a member. The bot spaces these actions out so it does not burst.

## Reporter standing

The bot counts approved and rejected reports for each community. A community with 5 or more rejected reports and a rejection rate over 60% can no longer report. The dashboard shows a notice on the Global list page. An owner can reset the record from **Reporter standing**.

## Appeals

A listed user appeals by sending a direct message to the bot:

`listappeal <text>`

Each entry can have one open appeal. Appeals land in the same review queue. Approving an appeal removes the entry and records the removal.

## Commands

| Command | Aliases | Who | Purpose |
| --- | --- | --- | --- |
| `reportuser <userId> <category> <reason>` | `globalreport` | Staff | Report a user. Message links and attached images count as evidence |
| `listcheck <userId>` | `globalcheck` | Anyone | Check whether a user is on the list |
| `listappeal <text>` | `globalappeal` | Listed user, DM only | Appeal your own entry |
| `listqueue` | `globalqueue` | Owners, reviewers | Show pending entries and appeals |
| `listapprove <id> [note]` | `globalapprove` | Owners, reviewers | Approve a pending entry |
| `listreject <id> [note]` | `globalreject` | Owners, reviewers | Reject a pending entry |
| `listappealapprove <id> [note]` | `globalappealapprove` | Owners, reviewers | Approve an appeal and remove the entry |
| `listappealreject <id> [note]` | `globalappealreject` | Owners, reviewers | Reject an appeal |
| `listremove <id> [note]` | `globalremove` | Owners | Remove a live entry |
