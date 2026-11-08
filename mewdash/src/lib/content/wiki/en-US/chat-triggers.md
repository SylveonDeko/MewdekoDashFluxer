---
title: Triggers
slug: chat-triggers
summary: Automatic replies to messages and bot events, with conditions you set
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, blocks, event triggers, share code]
related: [administration, xp, currency, tickets, giveaways]
---

## What it does

A trigger is a piece of text the bot watches for and a response it sends when it sees it. In the simplest form, a member types `hello` and the bot replies `hi there`. From there a trigger can match anywhere in a message or by regular expression. It can respond with an embed or react with emoji, and it can send the reply as a DM. It can also delete the member's message, grant or remove roles, post a copy to another channel or webhook, ask the member a question first, and run a second trigger when it finishes.

Triggers do not have to be messages. The same trigger can fire when someone adds or removes a reaction, or on a bot event such as a level up, a member joining, a ticket opening, a giveaway being won or a role being added.

Each trigger carries its own conditions: a cooldown, a required XP level, a currency cost or reward, active hours and days, an expiry date, a use limit, a minimum account age or time in the community, channel and role restrictions, and a counter that has to be within a range. If a condition fails the trigger stays quiet, or shows a message you wrote. The tester tells you which rule would block a sample message.

Responses can read values from the rest of the bot: the member's level, balance, reputation or message count, the text after the trigger, the people they mentioned, the message they replied to, capture groups from a regex, the member's answer to a prompt, and community-wide counters. Logic blocks add conditions, variables and math inside a response.

## Why you would use it

- Auto-answer common questions: `!rules` posts the rules embed.
- Fun commands members can run for free without the bot's built-in command set.
- A `daily` style trigger that pays currency once per user per day using a cooldown and a reward.
- A "verify" word that grants a role and deletes the message.
- Reaction roles that hand out a role when someone reacts with a given emoji.
- Custom level-up or welcome announcements, formatted the way you like, fired by the event instead of a message.
- Running counters like "days since last incident" that anyone can bump with a word.

## The Triggers page

The page has several cards: **Triggers**, **Categories**, **Counters**, **Import and export** and **Placeholders and blocks**. **Categories** only appears once a trigger has a category.

### Triggers card

The card lists every trigger with an on/off switch, its text, a one-line preview of the response, how many times it was used and badges for its category, reaction, event, regex, staff only, cooldown, cost and use limit. Disabled triggers are dimmed.

- **New trigger** opens the editor with the defaults below. Fill in the **Trigger** text and a **Response**, then click **Create**.
- Click a row or the pencil to edit. Edits save as you make them.
- The row buttons duplicate (the copy is created disabled), copy a share code, or delete after a confirmation. On a phone these are under the three dot menu.
- The search box matches trigger text and response text. The dropdowns filter by category, type (message, reaction or bot event) and status, and sort by newest, oldest, most used or name.

A trigger cannot be created or saved without trigger text, a valid regex and a response. A response is not needed when **Send no message** or **React to the message instead** is on.

### The editor

The top of the editor has the **Trigger** text, the **Match** dropdown, the **Response** editor, **Add a response** for extra responses, and **When there are several responses** once you have more than one. Everything else sits in collapsible groups that show a count of the settings in use.

| Group | Settings |
| --- | --- |
| Types and matching | Fires on, Prefix, Custom prefix, Allow naming a target |
| Delivery | Reply to the message, Send as a DM, Send as the bot, not as a reply to the member, Send no message, Delete the triggering message, React to the message instead, Reactions, Delete the response after (seconds), Always respond in, Also post in, Also post to webhook, Then run another trigger |
| Access | Staff only, Only in age-restricted channels, Respond to bots instead of people, Only in these channels, Never in these channels, Never for these roles |
| Prompt | Question to ask first, Seconds to answer |
| Limits | Cooldown (seconds), Cooldown applies to, Maximum uses, Stop firing at, Minimum account age (minutes), Minimum time in community (minutes), Counter requirement with At least and At most, Only active at certain hours with From, Until and Days |
| Costs and rewards | Cost, Reward, XP reward, Required level, Message when requirements are not met |
| Events | Fires on, Respond in, Only for this role |
| Roles | Roles to give, Roles to remove, Apply roles to |
| Category | Category |
| Test and history | Sample message with a Test button, and how often and by whom it fired |

### Categories and Counters

- **Categories** shows each category with how many of its triggers are enabled, and **Enable all** and **Disable all** buttons.
- **Counters** lists the community's counters. Add one with a **Name** and **Value**. Values can be edited in place, and a counter can be deleted. Deleting asks for confirmation and removes every member's value under that name. A counter with per-member values shows how many.

### Import and export

**Share code** with **Import** adds a trigger from a share code. **Export all** downloads every trigger as `chat-triggers.yml`. **Import file** loads triggers from a YAML file. Each trigger's share code is copied with the share button on its row.

### Placeholders and blocks

A reference card with two sections. **Placeholders** lists the trigger placeholders and every placeholder the bot reports, and **Blocks** lists the logic blocks, comparison operators and math symbols. Click an entry to copy it.

## Trigger types

A trigger has a set of enabled types. Message is on by default. In the editor they are the **Fires on** toggles under **Types and matching**.

| Type | Toggle | Fires when |
| --- | --- | --- |
| Message | Message | A message matches the trigger text |
| Reactions | Reaction added | Someone adds the trigger emoji to a message |
| ReactionsRemoved | Reaction removed | Someone removes the trigger emoji from a message |
| Event | Bot event | One of the bot events below happens |

At least one type stays on. Choosing an event in **Events** turns on **Bot event** for you.

### Message matching

The **Match** dropdown has three options:

| Option | Behaviour |
| --- | --- |
| Exact message | The whole message, lower-cased, must equal the trigger (default) |
| Contains the text | The trigger must appear as a whole word somewhere in the message |
| Regex | The message is matched against the pattern |

**Allow naming a target** lets the message start with the trigger followed by a space and more text, which becomes `%target%`.

Regex triggers get 100 milliseconds per pattern. One that times out is skipped. Named or numbered capture groups are available in the response as `%regex.1%` or `%regex.name%`. The editor shows an invalid pattern in red and, with a pattern that is valid, lets you try **Test the pattern** against sample text and shows the match count.

The **Prefix** dropdown decides whether the message must start with a prefix before matching:

| Option | Behaviour |
| --- | --- |
| No prefix needed | Match the bare text (default) |
| Global prefix | Must start with the bot's global prefix |
| Community prefix or global | Must start with the community prefix, falling back to the global one |
| Community prefix if set | Must start with the community prefix, with no prefix needed when the community has none |
| A custom prefix | Must start with the **Custom prefix** you enter |

If several triggers match one message, one of them is picked at random. Messages from bots and webhooks are ignored unless a trigger has **Respond to bots instead of people** on, and such a trigger then responds only to bot messages. The bot never responds to its own messages.

### Reaction triggers

`.addreactiontrigger <emoji> <response>` creates a trigger whose text is the emoji, with **Reaction added** on. Turn on **Reaction removed** as well for toggle style reaction roles. The response is posted in the channel of the reacted message, and role grants use the reacting member, or for **Members they mention** the mentions in the reacted message. Reactions from bots are ignored.

### Event triggers

Set **Fires on** under **Events**. The options are:

| Option | Fires for |
| --- | --- |
| Member levels up | A member gains a level |
| Member levels down | A member loses a level |
| Member joins | A member joins |
| Member leaves | A member leaves |
| Member joins voice | A member joins a voice channel |
| Member leaves voice | A member leaves a voice channel |
| Ticket opened | A ticket is opened |
| Ticket closed | A ticket is closed |
| Giveaway won | A member wins a giveaway |
| Role added to a member | A member gains a role |
| Role removed from a member | A member loses a role |

**Respond in** picks the channel for the response. Left empty it uses the channel where the event happened. Joins, leaves and voice events have no channel of their own, so those triggers need an explicit channel or they do nothing. For the two role events, **Only for this role** limits the trigger to one role, and `%role.mention%` mentions it. The member the event concerns is treated as the user for placeholders and role grants. Event triggers run through the same conditions and economy checks as message triggers.

## Responses

The **Response** is the main message. It goes through the embed parser, so it can be plain text or an embed built in the editor. **Add a response** adds extra responses, and **When there are several responses** decides which are sent:

| Mode | Behaviour |
| --- | --- |
| Always the first | Always the first response (default) |
| Random | One picked at random. Repeat a line to weight it |
| In order, one per use | In order, one per use, shared across the community |
| Send all of them | Every response, in order |

Delivery options under **Delivery**, all off by default:

- **Reply to the message** sends the response as a reply.
- **Send as a DM** sends it to the member privately.
- **Send as the bot, not as a reply to the member** hides who fired it. The response does not reply to the member and member placeholders show the bot.
- **Send no message** is for role-only triggers.
- **Delete the triggering message** removes what they typed. It cannot be combined with reacting.
- **React to the message instead** puts emoji on their message rather than sending a reply. Pick up to six under **Reactions**, which are added one per second.
- **Delete the response after (seconds)** removes the bot's reply after a delay, up to 86400. 0 keeps it.
- **Always respond in** sends the response to one channel, whatever channel the trigger fired in.

### Crossposting

**Also post in** posts a copy of every response to another channel in the community. **Also post to webhook** posts it through a webhook URL instead, which can be in another community. Crossposting happens even when **Send no message** is on.

### Roles

**Roles to give** and **Roles to remove** are applied when the trigger fires. **Apply roles to** chooses who is affected:

| Option | Who is affected |
| --- | --- |
| Whoever used it | The member who fired the trigger (default) |
| Members they mention | Up to five members mentioned in the message |
| Both | The sender plus up to four mentioned members |

When the target includes mentions, the mentions are stripped from the message before matching, so `verify @someone` still matches a trigger of `verify`.

### Chaining

**Then run another trigger** runs a second trigger after the first one finishes. The second is evaluated on its own terms, including its conditions and costs. A chain stops after five steps and never revisits a trigger it has already run.

### Prompts

Under **Prompt**, set a **Question to ask first**. The bot asks it and waits for the member's next message, then that answer is `%prompt%` in the response. **Seconds to answer** is 5 to 120 and defaults to 30. Event and reaction triggers have nobody to ask, so they never prompt.

## Access

Access settings decide who can fire the trigger and where. They are checked before the trigger's costs and limits.

- **Staff only** limits it to members with Manage Messages.
- **Only in age-restricted channels** limits it to age-restricted channels.
- **Only in these channels** limits it to the listed channels. Empty means any channel.
- **Never in these channels** and **Never for these roles** block the listed channels and roles.

## Conditions

All of these are checked before anything is charged, sent or counted. A failed condition means the trigger silently does not fire, except for the level and currency checks, which show the **Message when requirements are not met** if you set one.

| Condition | Command | Default | Behaviour |
| --- | --- | --- | --- |
| Cooldown | `.ctcooldown <id> <seconds> [scope]` | none | Blocks repeat fires. **Cooldown applies to** is Each member, Everyone in the channel or The whole community |
| Required level | `.ctreqlevel <id> <level>` | 0 | The member's XP level must be at least this |
| Cost | `.ctcost <id> <amount>` | 0 | Currency taken from the member. No fire if they cannot pay |
| Reward | `.ctreward <id> <amount>` | 0 | Currency paid to the member when it fires |
| XP reward | `.ctxpreward <id> <amount>` | 0 | XP granted when it fires |
| Active hours | `.cttime <id> <HH:mm> <HH:mm> [days...]` | always | Only fires inside the window. An end before the start runs overnight. The editor day buttons run Sun to Sat |
| Expiry | `.ctexpiry <id> [duration]` | never | Stops firing at the **Stop firing at** time. The command takes a duration such as `7d` |
| Use limit | `.ctmaxuses <id> <uses>` | unlimited | **Maximum uses**. 0 in the command removes the limit |
| Minimum account age | `.ctminage <id> [duration]` | none | The account must be at least this old. Set in minutes on the page |
| Minimum time in community | `.ctminmember <id> [duration]` | none | The member must have joined at least this long ago. Set in minutes on the page |
| Counter range | `.ctrequirecounter <id> <name> [min] [max]` | none | The named counter must be within the range. `clear` as the name removes it |

The cooldown starts only after every other condition passes, so a blocked attempt does not consume it. The cost is taken before the reward is paid, so a trigger that both costs and pays never pays someone who could not afford it.

## Counters

Counters are named numbers stored per community. They are created the first time a response uses them and can be read or changed from any response:

| Placeholder | Effect |
| --- | --- |
| `%counter:name%` | Shows the counter |
| `%counter:name+%` | Adds one and shows the new value |
| `%counter:name-%` | Subtracts one and shows the new value |
| `%usercounter:name%` | Shows the firing member's own value for that name |
| `%usercounter:name+%` | Adds one to the member's value |
| `%usercounter:name-%` | Subtracts one from the member's value |

Names are up to 64 letters, digits, underscores or hyphens and are case-insensitive. `.ctcounters` lists them and `.ctcounterset` sets one to an exact value. `.ctcounterdelete` removes it along with every per-user value under that name. The **Counters** card on the page does the same.

## Placeholders

A response can use the general placeholder set (user, community, channel, bot and time placeholders from the placeholders page) and the trigger placeholders below. Other modules contribute placeholders too. `.ctplaceholders` lists the contributed ones live, and the **Placeholders and blocks** card lists them on the page.

| Placeholder | Value |
| --- | --- |
| `%target%` | Everything typed after the trigger (needs **Allow naming a target** or **Contains the text**) |
| `%prompt%` | The member's answer to the prompt |
| `%targetuser%` | Mention of the first person mentioned in the message |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | That person's ID, username and avatar |
| `%targetusers%`, `%targetusers.id%` | Everyone mentioned, as mentions or IDs |
| `%replied.content%` | Content of the message the member replied to |
| `%replied.author%`, `%replied.author.id%` | Author of that message |
| `%usecount%` | How many times this trigger has fired |
| `%regex.1%`, `%regex.name%` | Capture groups of a regex trigger |
| `%role.mention%` | The role of a role added or removed event |
| `%img:tag%` | A random Imgur image for that tag |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | The member's XP stats |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | The mentioned person's XP stats |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | The member's currency |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | The mentioned person's currency |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputation |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Message counts |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Invite counts and who invited the member |
| `%targetuser.afk%` | The mentioned person's AFK message |
| `%counter:name%` and friends | Counters, as above |

Mentions inside `%target%` are neutralised unless the member could ping everyone themselves.

> [!EXAMPLE]
> Trigger `daily`, response `%user.mention% claimed today's bonus. Balance: %currency.balance%`, with `.ctreward 12 100`, `.ctcooldown 12 86400 User` and `.ctreqmsg 12 Come back tomorrow.`

## Logic blocks

Blocks run after placeholders are filled in and can nest. The **Placeholders and blocks** card lists them.

| Block | What it does |
| --- | --- |
| `{if(a==b):then\|else}` | Shows the first part when the comparison is true, otherwise the second |
| `{set(name):value}` | Stores a variable for the rest of the run |
| `{get(name)}` | Shows a variable set earlier in the same run |
| `{math:(1+2)*3}` | Calculates the expression |
| `{upper:text}`, `{lower:text}` | Turns the text uppercase or lowercase |
| `{length:text}` | The number of characters in the text |
| `{replace(a,b):text}` | Replaces every a in the text with b |
| `{choose:a\|b\|c}` | Picks one of the options at random |
| `{cmd:name args}` | Runs a command as the member who fired the trigger, up to 3 per run |
| `{require(role,channel):message}` | Stops with the message unless the member has every role and is in a listed channel |
| `{blacklist(role,channel):message}` | Stops with the message if the member has a listed role or is in a listed channel |
| `{override}` | Lets members with Manage Messages bypass require and blacklist |

Comparison operators for `if` are `==`, `!=`, `>`, `<`, `>=`, `<=` and `contains`. Math supports `+`, `-`, `*`, `/` and `%` for the remainder.

The evaluator caps nesting at 8 levels, a run at 300 blocks, the output at 8000 characters, `require` and `blacklist` lists at 25 items, and a run at 50 variables of up to 1000 characters each. Math expressions are limited to 200 characters.

## The tester

`.cttest <id> <sample message>` or the **Sample message** box with **Test** under **Test and history** checks whether that message would fire the trigger as you, without sending, charging or counting anything. It says whether the text matched and, if the trigger would not fire, which rule stops it, such as being disabled, bots only, no match, expiry, cooldown, counter, use limit, active hours, account age, membership, level or balance.

Opening **Test and history** also shows how many times the trigger has fired and who fired it recently. `.ctstats <id>` shows the same in chat.

## Categories and organisation

Type a **Category** in the editor to group triggers. The **Categories** card enables or disables every trigger in a category at once, and `.ctcategorytoggle <name> <true or false>` does the same. The switch on a row, or `.cttoggle`, pauses one trigger without deleting it.

`.ctsexport` downloads every trigger as a YAML file and `.ctsimport` loads one from an attachment or URL. Share codes are made with the share button on a row and loaded with **Import** on the page. `.ctsclear` deletes every trigger after confirmation.

## Setup walkthrough

1. Open **Triggers** in the dashboard and click **New trigger**.
2. Enter the **Trigger** word, pick **Contains the text** under **Match** if it should work mid-sentence, and write the **Response**.
3. Click **Create**. The editor stays open on the new trigger.
4. Under **Delivery**, choose how the bot responds, for example by replying or by deleting the member's message.
5. Under **Limits**, set a **Cooldown (seconds)** so it cannot be spammed.
6. Under **Test and history**, type a sample message and click **Test**. Fix whatever it says is blocking.
7. For a level-up announcement, create a trigger with any text, set **Fires on** under **Events** to **Member levels up**, leave **Respond in** empty to post where the member was talking, and use `%user.mention%` and `%xp.level%` in the response.
8. Give related triggers a **Category** so you can pause them together.

## Commands

Run these with your community's prefix (`.` unless you changed it). Trigger IDs are shown by `.listchattriggers`. Every command needs Administrator except the ones marked otherwise.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `.addchattrigger <trigger> <response>` | `act`, `acr` | Create a trigger. Quote multi-word triggers |
| `.addchattriggerregex <pattern> <response>` | `actr` | Create a regex trigger |
| `.addreactiontrigger <emoji> <response>` | `addrt` | Create a reaction trigger |
| `.editchattrigger <id> <response>` | `ect` | Replace the primary response |
| `.deletechattrigger <id>` | `dct` | Delete a trigger |
| `.listchattriggers` | `lct` | List triggers with IDs |
| `.listchattriggersgroup` | `lctg` | List triggers grouped by text |
| `.showchattrigger <id>` | `sct` | Show one trigger's settings |
| `.cttoggle <id>` | `chattriggertoggle` | Pause or resume a trigger |
| `.ctca <id>` | | Toggle match anywhere |
| `.ctat <id>` | | Toggle allow targeting |
| `.ctdm <id>` | | Toggle DM response |
| `.ctad <id>` | | Toggle deleting the triggering message |
| `.rtt <id>` | `reactottrigger` | Toggle reacting to the message instead of the reply |
| `.ctnr <id>` | `chattriggernoresponse` | Toggle sending no message |
| `.ctreply <id>` | `chattriggerreply` | Toggle replying to the message |
| `.ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Delete the response after a delay |
| `.ctreact <id> [emoji...]` | `ctr` | Set up to six reactions, or clear them |
| `.ctaddresponse <id> <response>` | `chattriggeraddresponse` | Add an extra response |
| `.ctclearresponses <id>` | `chattriggerclearresponses` | Remove extra responses |
| `.ctresponsemode <id> <mode>` | `chattriggerresponsemode` | `Single`, `Random`, `RoundRobin` or `All` |
| `.ctprefixtype <id> <type>` | `chattriggersprefixtype`, `chattriggerprefixtype` | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` or `Custom` |
| `.ctprefix <id> <prefix>` | `chattriggersprefix`, `chattriggerprefix` | Set the custom prefix |
| `.chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Enable or disable a trigger type |
| `.ctallowbots <id>` | `chattriggerallowbots` | Toggle responding to bot messages only |
| `.ctmatchembeds <id>` | `chattriggermatchembeds` | Toggle matching text inside embeds |
| `.ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Toggle a role to grant |
| `.ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Toggle a role to remove |
| `.chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | `Sender`, `Mentioned` or `Both` |
| `.chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel` | Crosspost to a channel |
| `.chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook` | Crosspost through a webhook |
| `.ctevent <id> <event>` | `chattriggerevent` | Fire on an event, or `None` to stop |
| `.cteventchannel <id> [#channel]` | `chattriggereventchannel` | Channel for event responses |
| `.ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Per-trigger cooldown |
| `.ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Required XP level |
| `.ctcost <id> <amount>` | `chattriggercost` | Currency cost |
| `.ctreward <id> <amount>` | `chattriggerreward` | Currency reward |
| `.ctxpreward <id> <amount>` | `chattriggerxpreward` | XP reward |
| `.ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Message when a requirement fails |
| `.cttime <id> <start> <end> [days...]` | `chattriggertime` | Active hours, or `.cttime <id> clear` |
| `.ctexpiry <id> [duration]` | `chattriggerexpiry` | Expiry, or none to clear |
| `.ctmaxuses <id> <uses>` | `chattriggermaxuses` | Use limit, 0 for none |
| `.ctminage <id> [duration]` | `chattriggerminimumage` | Minimum account age |
| `.ctminmember <id> [duration]` | `chattriggerminimummembership` | Minimum time in the community |
| `.ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Counter range requirement |
| `.ctcounters` | `chattriggercounters` | List counters (no permission needed) |
| `.ctcounterset <name> <value>` | `chattriggercounterset` | Set a counter |
| `.ctcounterdelete <name>` | `chattriggercounterdelete` | Delete a counter |
| `.ctplaceholders` | `chattriggerplaceholders` | List contributed placeholders (no permission needed) |
| `.ctcategory <id> [name]` | `chattriggercategory` | Set or clear a category |
| `.ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Enable or disable a category |
| `.ctchain <id> <nextId>` | `chattriggerchain` | Chain to another trigger, 0 to clear |
| `.cttest <id> <sample>` | `chattriggertest` | Dry-run a sample message |
| `.ctstats <id>` | `chattriggerstats` | Fire count and recent users |
| `.ctsexport` | | Export triggers as YAML |
| `.ctsimport [url]` | | Import from a URL or attachment |
| `.ctsmigrate` | `ctsconvert` | Convert old embed format, with a backup |
| `.ctsclear` | | Delete every trigger |
| `.ctsreload` | | Reload triggers from the database (bot owner) |
| `.ctstaff <id>` | `chattriggerstaff` | Toggle staff only |
| `.ctnsfw <id>` | `chattriggernsfw` | Toggle age-restricted channels only |
| `.ctchannels <id> [#channels...]` | `chattriggerchannels` | Limit to channels, or none to clear |
| `.ctdenychannels <id> [#channels...]` | `chattriggerdenychannels` | Block channels, or none to clear |
| `.ctdenyroles <id> [@roles...]` | `chattriggerdenyroles` | Block roles, or none to clear |
| `.ctanonymous <id>` | `chattriggeranonymous` | Toggle hiding who fired the trigger |
| `.ctreplychannel <id> [#channel]` | `chattriggerreplychannel` | Always respond in one channel |
| `.ctprompt <id> [question]` | `chattriggerprompt` | Ask a question first, or none to clear |
| `.ctprompttime <id> <seconds>` | `chattriggerprompttime` | Seconds to answer the prompt, 5 to 120 |
| `.cteventrole <id> [@role]` | `chattriggereventrole` | Role a role added or removed event reacts to |
| `.ctblocks` | `chattriggerblocks` | List the logic blocks (no permission needed) |
| `.ctraw <id>` | `chattriggerraw` | Show a trigger's response source (owner or staff) |
| `.ctshare <id>` | `chattriggershare` | Make a share code for another community |
| `.ctshareimport [code]` | `chattriggershareimport` | Import a share code, or attach it as a file |
| `.ctmembers` | `chattriggermembers` | Toggle whether members can manage their own triggers |
| `.ctmemberadd <trigger> <response>` | `ctmadd` | Create a trigger you own (members, when allowed) |
| `.ctmemberedit <id> <response>` | `ctmedit` | Change a trigger you own |
| `.ctmemberdelete <id>` | `ctmdelete` | Delete a trigger you own |
| `.ctmine` | `chattriggermine` | List the triggers you created |
| `.ctclaim <id>` | `chattriggerclaim` | Take over a trigger whose creator has left |

Sending as the bot is set on the dashboard.

## Tips and gotchas

- Triggers are matched against the lower-cased message, so trigger text is effectively case-insensitive.
- With **Match** on **Exact message**, the trigger must be the entire message. `hello there` will not fire a trigger of `hello` unless you use **Contains the text** or allow a target.
- Role grants need Manage Roles and the bot's role above the roles involved. The command that adds a role to the list also checks that you can manage it.
- Bots only triggers never respond to humans, and human triggers never respond to bots. A single trigger cannot do both.
- Cooldowns live in memory and reset when the bot restarts. Use limits and expiry are stored and survive restarts.
- In order responses share one position for the whole community, not one per member.
- Event triggers for joins, leaves and voice silently do nothing until you set **Respond in**.
- Prompts do nothing for reaction and event triggers.
- Edits to a trigger save as you type, but a trigger with a problem, such as an empty response, is not saved until it is fixed.
