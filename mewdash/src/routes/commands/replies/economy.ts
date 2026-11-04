import { ago, type ChatEmbed, type ChatEmbedField, type ChatTextMessage } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, bot, chat, confirm, ERROR, error, MEMBER, OK, reply, sylveon, TIME, users, type CommandPreview } from "./chat";

const COIN = "🪙";
const GREEN = "#2ecc71";
const BLUE = "#3498db";
const RED = "#e74c3c";
const GOLD = "#f1c40f";
const ORANGE = "#e67e22";
const NONE = "#4e5058";
const BLANK = "​";

const field = (name: string, value = BLANK, inline = true): ChatEmbedField => ({ name, value, inline });

const game = (color: string, title: string, description: string | undefined, ...fields: ChatEmbedField[]): ChatEmbed => ({
  color,
  title,
  ...(description ? { description } : {}),
  fields,
});

const success = (text: string) => confirm(`✅ ${text}`);

const you = "**SylveonDeko**";

const say = (text: string): ChatTextMessage => ({ author: "sylveon", time: TIME, text });

const repConfigUpdated = (input: string) => reply(input, success("Reputation configuration updated."));

const repGiven = (input: string) => reply(input, success(`Gave +1 rep to ${MEMBER} | Total: 15`));

const repBoard = (input: string) =>
  reply(
    input,
    {
      color: OK,
      title: "Reputation Leaderboard",
      description:
        "`1.` **SylveonDeko** - 42 rep\n`2.` **Mewdeko** - 31 rep\n`3.` **Biscuit** - 15 rep\n`4.` **Pixel** - 12 rep\n`5.` **Waffles** - 9 rep\n",
      footer: "Page 1",
    },
  );

const repCheck = (input: string, name: string, total: number, rank: number) =>
  reply(input, confirm(`${you} ${name} has ${total} reputation (Rank #${rank})`));

const blackjackTable = (title: string, dealer: string, dealerTotal: number, player: string, playerTotal: number): ChatEmbed[] => [
  {
    color: BLUE,
    title,
    fields: [field("Dealer Hand", dealer, false), field(`Dealer Total: ${dealerTotal}`, "_ _", false)],
  },
  {
    color: OK,
    fields: [field("Player Hand", player, false), field(`Player Total: ${playerTotal}`, "_ _", false)],
  },
];

const shopEntry = (name: string, ...details: string[]) => field(name, details.join("\n"), false);

const shopItem = "Mystery Box";

const triviaOptions = "1️⃣ Au\n2️⃣ Ag\n3️⃣ Fe\n4️⃣ Cu";

export const economyPreviews: Record<string, CommandPreview> = {
  userstatsoptout: reply("userstatsoptout", confirm("Successfully disabled command stats collection.")),
  setzodiac: reply("setzodiac leo", confirm("Your Zodiac has been set to:\n`leo`")),
  setswitchfc: reply("setswitchfc sw-1234-5678-9012", confirm("Your Switch Friend Code has been set to sw-1234-5678-9012.")),
  setpronouns: reply("setpronouns they/them", confirm("Your pronouns are now they/them.")),
  setprofileimage: reply("setprofileimage https://cdn.mewdeko.tech/Mewdeko.png", {
    color: OK,
    description: "Sucesffully set the profile image to:",
    image: { src: "/img/Mewdeko.png", width: 256, height: 256 },
  }),
  setprofilecolor: reply("setprofilecolor #ff69b4", confirm("Your Profile Color has been set to:\n`#ffff69b4`")),
  setprivacy: reply("setprivacy private", confirm("Privacy succesfully set to `Private`")),
  setbirthdayprivacy: reply("setbirthdayprivacy monthonly", confirm("Your birthday display mode has been set to MonthOnly")),
  setbirthday: reply("setbirthday 6/14/2001", confirm("Your birthday has been set to 6/14/2001")),
  setbio: reply("setbio Fluxer bot tinkerer and full time Sylveon enjoyer.", confirm("Your Profile Bio has been set to:\nFluxer bot tinkerer and full time Sylveon enjoyer.")),
  pronounsreport: reply(`pronounsreport ${MEMBER}`, confirm(`${you} Pronouns reported, thanks for helping keep mewdeko safe.`)),
  pronounsforceclear: reply(`pronounsforceclear ${MEMBER} false Joke pronouns`, confirm("The user's pronouns have been cleared and cannot be recovered.")),
  pronouns: reply(
    `pronouns ${MEMBER}`,
    confirm("Biscuit uses they/them pronouns (retrieved from [PronounDB](https://pronoundb.org/docs))"),
  ),
  profile: reply("profile", {
    color: OK,
    title: "Profile for SylveonDeko",
    description: "Fluxer bot tinkerer and full time Sylveon enjoyer.",
    thumbnail: { src: users.sylveon.avatar, width: 128, height: 128 },
    fields: [
      field("Pronouns", "he/him", false),
      field("Zodiac Sign", "Gemini", false),
      field("Birthday", "6/14/2001", false),
      field("Mutual Bot Communities", "4", false),
      field("Switch Friend Code", "sw-1234-5678-9012", false),
    ],
  }),
  greetdmoptout: reply(
    "greetdmoptout",
    confirm(`${you} You have been opted out of greet dms. Keep in mind this only works where mewdeko is used for greet dms.`),
  ),
  deleteuserstatsdata: reply("deleteuserstatsdata", error("Command stats deleted.")),

  rep: reply(`rep ${MEMBER} standard Helped me fix my config`, success(`Gave +1 rep to ${MEMBER} | Total: 15`)),
  repgive: repGiven(`repgive ${MEMBER}`),
  giverep: repGiven(`giverep ${MEMBER} helper Great explanation`),
  repanon: repGiven(`repanon ${MEMBER}`),
  anonrep: repGiven(`anonrep ${MEMBER}`),
  repcheck: repCheck(`repcheck ${MEMBER}`, "Biscuit", 15, 3),
  checkrep: repCheck(`checkrep ${MEMBER}`, "Biscuit", 15, 3),
  myrep: repCheck("myrep", "SylveonDeko", 42, 1),
  toprep: repBoard("toprep"),
  reptop: repBoard("reptop"),
  replb: repBoard("replb"),
  repleaderboard: repBoard("repleaderboard"),
  rephistory: reply(`rephistory ${MEMBER}`, {
    color: OK,
    title: "Reputation History for Biscuit",
    description:
      "11/02 18:12 - **SylveonDeko** +1\n└ Helped me fix my config\n11/01 09:40 - **Pixel** +1\n└ Great explanation\n10/29 21:05 - **Waffles** +1\n",
    footer: "Showing recent entries (7 total)",
  }),
  repstats: reply(`repstats ${MEMBER}`, {
    color: OK,
    title: "Reputation Statistics for Biscuit",
    fields: [
      field("Total Reputation", "15"),
      field("Community Rank", "#3"),
      field("Total Given", "9"),
      field("Total Received", "15"),
      field("Current Streak", "3"),
      field("Longest Streak", "6"),
      field("Last Given", "2026-11-02 18:12 UTC"),
      field("Last Received", "2026-11-02 18:12 UTC"),
    ],
  }),
  repweeklylimit: repConfigUpdated("repweeklylimit 50"),
  repunfreeze: reply(`repunfreeze ${MEMBER}`, success(`Unfroze ${MEMBER}'s reputation.`)),
  reptyperemove: reply("reptyperemove coder", success("Removed custom reputation type: coder")),
  reptypelist: reply("reptypelist", {
    color: OK,
    title: "Custom Reputation Types",
    description: "**coder** - Code Helper\n**artist** - Artist",
  }),
  reptypeadd: reply("reptypeadd coder Code Helper", success("Added custom reputation type: coder (Code Helper)")),
  reptake: reply(`reptake ${MEMBER} 1`, success(`Removed 1 reputation from ${MEMBER} | New Total: 14`)),
  repstatus: reply("repstatus", {
    color: OK,
    title: "Reputation System Configuration",
    description: "Current reputation system settings for this community:",
    fields: [
      field(
        "⚙️ Basic Settings",
        "**System Enabled:** ✅ Enabled\n**Anonymous Reputation:** ✅ Enabled\n**Negative Reputation:** ❌ Disabled",
        false,
      ),
      field(
        "⏰ Cooldowns & Limits",
        "**Default Cooldown:** 60 minutes\n**Daily Limit:** 10\n**Weekly Limit:** None",
        false,
      ),
      field(
        "📋 Requirements",
        "**Minimum Account Age:** 7 days\n**Minimum Community Membership:** 24 hours\n**Minimum Messages:** 10",
        false,
      ),
      field("🔔 Notifications", "**Notification Channel:** <#general>", false),
      field(
        "🔧 Advanced",
        "**Reputation Decay:** ❌ Disabled\n**Decay Type:** weekly\n**Decay Amount:** 1\n**Inactive Days for Decay:** 30 days",
        false,
      ),
    ],
    footer: "Change any setting with its rep command. Use the help command on the Reputation module to see them all.",
  }),
  repset: reply(`repset ${MEMBER} 25`, success(`Set ${MEMBER}'s reputation to 25`)),
  reproleremove: reply("reproleremove VIP", success("Removed role reward for VIP.")),
  reprolechannel: reply("reprolechannel VIP <#general>", success("Role reward announcements for **VIP** will be posted in **#general**.")),
  reprole: reply("reprole VIP 100", success("Added role reward: **VIP** at **100** reputation.")),
  represet: reply(`represet ${MEMBER}`, success(`Reset ${MEMBER}'s reputation to 0.`)),
  repreactionremove: reply("repreactionremove ⭐", success("Removed reaction reputation for ⭐.")),
  repreactionlist: reply("repreactionlist", {
    color: OK,
    title: "Reaction Reputation Configuration",
    description: "✅ ⭐ - 1 standard rep\n✅ 👍 - 1 helper rep\n",
  }),
  repreaction: reply("repreaction ⭐ 1 standard", success("Added reaction reputation: ⭐ gives 1 standard rep.")),
  repnotificationchannel: repConfigUpdated("repnotificationchannel <#general>"),
  repnegative: repConfigUpdated("repnegative false"),
  repminmessages: reply("repminmessages 10", success("Min Messages: 10")),
  repminmembership: reply("repminmembership 24", success("Min Membership: 24 hours")),
  repminage: reply("repminage 7", success("Min Account Age: 7 days")),
  repmilestonelost: reply(
    `repmilestonelost ${MEMBER} VIP 100`,
    success(`${MEMBER}, you've lost the VIP role due to reputation dropping below 100.`),
  ),
  repimport: reply("repimport", confirm("Reputation configuration imported successfully!")),
  repfreeze: reply(`repfreeze ${MEMBER}`, success(`Froze ${MEMBER}'s reputation.`)),
  repexport: reply("repexport", "✅ Reputation configuration exported successfully!"),
  repeventlist: reply("repeventlist", {
    color: OK,
    title: "Active Reputation Events",
    description: "**Double Rep Weekend**: 2.0x until 2026-11-05 18:12 UTC",
  }),
  repeventend: reply("repeventend Double Rep Weekend", success("Reputation event 'Double Rep Weekend' has ended.")),
  repeventcreate: reply(
    "repeventcreate DoubleRepWeekend 2 72",
    success("Reputation event 'DoubleRepWeekend' created: 2x multiplier until 11/5/2026 6:12:00 PM."),
  ),
  repenable: reply("repenable true", success("Enabled: True")),
  repdecaytype: repConfigUpdated("repdecaytype weekly"),
  repdecayinactive: repConfigUpdated("repdecayinactive 30"),
  repdecayamount: repConfigUpdated("repdecayamount 1"),
  repdecay: reply("repdecay true", success("Reputation decay enabled: 1 per daily.")),
  repdailylimit: reply("repdailylimit 10", success("Daily Limit: 10")),
  repcooldown: reply("repcooldown 60", success("Cooldown: 60 minutes")),
  repcommandreqremove: reply("repcommandreqremove daily", success("Removed reputation requirement for command **daily**.")),
  repcommandreqlist: reply("repcommandreqlist", {
    color: OK,
    title: "Command Reputation Requirements",
    description: "Commands that require reputation to use:",
    fields: [
      field(".dailyreward", "**Min Rep:** 10 total"),
      field(".rob", "**Min Rep:** 25 helper\n**Channels:** #casino"),
    ],
  }),
  repcommandreq: reply(
    "repcommandreq dailyreward 10",
    success("Command requirement added: **dailyreward** now requires **10** total reputation."),
  ),
  repcommandinfo: reply("repcommandinfo dailyreward", {
    color: OK,
    title: "Reputation Requirements for dailyreward",
    fields: [field("Minimum Reputation", "10 total"), field("Show in Help", "✅")],
  }),
  repcommandbypass: reply("repcommandbypass dailyreward Moderator", success("Added bypass roles for **dailyreward**: Moderator")),
  repchannellist: reply("repchannellist", {
    color: OK,
    title: "Restricted Channels",
    description: "<#bot-spam>: disabled (x1.0)\n<#showcase>: enabled (x2.0)",
  }),
  repchannel: reply("repchannel <#bot-spam> disabled", success("Reputation disabled in <#bot-spam>.")),
  repanonymous: repConfigUpdated("repanonymous true"),

  work: reply("work", confirm(`You took a shift at the tavern. You earned 143 ${COIN}.`)),
  withdraw: reply("withdraw 500", confirm(`Withdrew 500 ${COIN} to your wallet.`)),
  wheelfortune: reply(
    "wheelfortune 100 risky",
    game(GREEN, "🎡 Wheel of Fortune 🎡", "The wheel landed on xx5.0!", field("Type: RISKY")),
  ),
  war: reply(
    "war 100",
    game(
      GREEN,
      "🎴 War 🎴",
      "You win! Your K♠️ beats the opponent's 9♦️!",
      field("Your Card", "K♠️"),
      field("Opponent's Card", "9♦️"),
    ),
  ),
  use: reply(`use ${shopItem}`, confirm(`You used one **${shopItem}**.`)),
  triviachain: chat(
    "general",
    sylveon("triviachain 100 science"),
    bot(
      {
        color: BLUE,
        title: "🧠 Trivia Chain 🧠",
        description: "What is the chemical symbol for gold?",
        fields: [
          field("Question 1: What is the chemical symbol for gold?", "_ _"),
          field("Multiplier: x1.5x", "_ _"),
          field(`Potential Win: 150 ${COIN}`, "_ _"),
          field(`Current Winnings: 0 ${COIN}`, "_ _"),
          field("Choose your answer:", triviaOptions, false),
        ],
      },
      [
        { emoji: "1️⃣", count: 1 },
        { emoji: "2️⃣", count: 1 },
        { emoji: "3️⃣", count: 1 },
        { emoji: "4️⃣", count: 1 },
      ],
    ),
  ),
  transactions: reply("transactions", {
    color: BLUE,
    title: "Transactions",
    description: "Transactions for SylveonDeko",
    fields: [
      field("1. Won: coinflip", `Amount: 200 ${COIN}\nDate: ${ago(240)}`, false),
      field("2. Bet placed: coinflip", `Amount: -100 ${COIN}\nDate: ${ago(255)}`, false),
      field("3. Daily Reward", `Amount: 200 ${COIN}\nDate: ${ago(3600)}`, false),
      field("4. Slot Machine", `Amount: -50 ${COIN}\nDate: ${ago(7200)}`, false),
    ],
    footer: "Page 1/3",
  }),
  stand: reply("stand", {
    embeds: [
      {
        color: ERROR,
        title: "Game Over",
        fields: [field("Dealer Hand", "10♦️ 8♣️", false), field("Dealer Total: 18", "_ _", false)],
      },
      {
        color: OK,
        fields: [
          field("Player Hand", "K♥️ 9♠️", false),
          field("Player Total: 19", "_ _", false),
          field("Player Result", "Won"),
        ],
      },
    ],
  }),
  spinwheel: reply(
    "spinwheel 100",
    game(GREEN, "You won!", `Result: +30%. Your balance changed by 30 ${COIN}`),
  ),
  slot: reply(
    "slot 100",
    game(
      OK,
      "🎰 Slot Machine 🎰",
      "🍒 | 🍒 | 💎",
      field("Bet", `100 ${COIN}`),
      field("Winnings", `200 ${COIN}`),
      field("Net Profit", `100 ${COIN}`),
    ),
  ),
  shoptoggle: reply(`shoptoggle ${shopItem}`, confirm(`**${shopItem}** is hidden from the shop. Nobody loses their copies.`)),
  shopstock: reply(`shopstock 20 ${shopItem}`, confirm(`**${shopItem}** now has 20 in stock.`)),
  shopremove: reply(`shopremove ${shopItem}`, confirm(`Removed **${shopItem}** from the shop.`)),
  shopprice: reply(`shopprice 300 ${shopItem}`, confirm(`**${shopItem}** now costs 300 ${COIN}.`)),
  shopdesc: reply(`shopdesc ${shopItem} | Contains a random surprise`, confirm(`Updated the description for **${shopItem}**.`)),
  shopaddrole: reply("shopaddrole 5000 @Supporter Supporter Role", confirm(`Added **Supporter Role** to the shop for 5000 ${COIN}.`)),
  shopadditem: reply(`shopadditem 250 ${shopItem}`, confirm(`Added **${shopItem}** to the shop for 250 ${COIN}.`)),
  shop: reply("shop", {
    color: OK,
    title: "The Deko Tree's Shop",
    description: "Buy something with `buy <item name>`.",
    fields: [
      shopEntry(shopItem, `Price: 250 ${COIN}`, "20 left", "Contains a random surprise"),
      shopEntry("Supporter Role", `Price: 5000 ${COIN}`, "Limit 1 per person"),
      shopEntry("Golden Ticket", `Price: 1000 ${COIN}`, "3 left", "Limit 1 per person"),
    ],
    footer: "Page 1/1",
  }),
  setdaily: reply("setdaily 200 1d", confirm(`Daily reward set to 200 ${COIN} with a cooldown of 1 day.`)),
  scratchcard: reply(
    "scratchcard bronze",
    game(
      GREEN,
      "🎫 Scratch Card 🎫",
      `🎉 Winner! You won 25 ${COIN}!`,
      field("Card Type: BRONZE"),
      field(`Cost: 10 ${COIN}`),
      field("Symbols: 🍀 🍀 🍀", BLANK, false),
    ),
  ),
  russianroulette: reply(
    "russianroulette 100",
    game(
      GREEN,
      "🔫 Russian Roulette 🔫",
      "Pull the trigger and test your luck!",
      field("Chambers: 4/6/6"),
      field("Bullets: 1"),
      field("Result", "Click... safe for now.", false),
      field("Outcome", `🍀 You survived! You won 20 ${COIN}!`, false),
    ),
  ),
  rps: reply("rps rock 100", {
    color: OK,
    title: "🖖 Rock Paper Scissors Lizard Spock 🦎",
    description: "You chose rock, I chose lizard",
    fields: [field("Result", "WIN"), field("Explanation", "Rock crushes Lizard"), field("Profit", `100 ${COIN}`)],
  }),
  roulette: reply(
    "roulette 100 red",
    game(
      OK,
      "🎰 Roulette 🎰",
      "The ball landed on 7 red!",
      field("Bet", `100 ${COIN} on red`),
      field("Result", "Won!"),
      field("Profit", `100 ${COIN}`),
    ),
  ),
  rob: reply(`rob ${MEMBER}`, confirm(`You lifted 85 ${COIN} from ${MEMBER}'s wallet.`)),
  plinko: reply(
    "plinko 100",
    game(
      GREEN,
      "🎯 Plinko 🎯",
      `🎉 Ball landed in x2 slot! You won 100 ${COIN}!`,
      field("Multiplier: x2.00x"),
      field("Slot: 6"),
    ),
  ),
  pay: reply(`pay ${MEMBER} 250`, confirm(`Sent 250 ${COIN} to ${MEMBER}.`)),
  modifybalance: reply(
    `modifybalance ${MEMBER} 500 Event prize`,
    confirm(`${you} ${MEMBER}'s Balance has been modified by 500 for the reason Event prize`),
  ),
  minesweeper: reply(
    "minesweeper 100",
    game(
      GREEN,
      "💣 Minesweeper 💣",
      `🎉 Perfect game! All safe squares revealed! You won 50 ${COIN}!`,
      field("Grid (3x3)", "3x3"),
      field("Mines: 2", "2"),
      field("Multiplier: x1.5", "x1.5"),
    ),
  ),
  memory: chat(
    "general",
    sylveon("memory 100"),
    bot({
      color: ORANGE,
      title: "🧠 Memory Game 🧠",
      description: "Sequence Hidden",
      fields: [field("Instructions", "Enter the sequence using numbers separated by spaces", false)],
    }),
    say("🔴 🟡 🟢 🔵"),
    bot(game(GREEN, "🧠 Memory Game 🧠", `Correct! You won 50 ${COIN}!`)),
  ),
  lottery: reply(
    "lottery 2",
    `You bought 2 lottery tickets for 100 ${COIN}!`,
    game(
      RED,
      "🎰 Lottery Draw #4821 🎰",
      `No winner this draw! Jackpot rolls over to 387 ${COIN}!`,
      field(`Each ticket costs 50 ${COIN}.`, `50 ${COIN}`),
      field("Your Tickets: 2"),
    ),
  ),
  keno: reply(
    "keno 100 5 12 33 47 68",
    game(
      GREEN,
      "🎱 Keno 🎱",
      `🎉 You matched 3 numbers! You won 100 ${COIN}!`,
      field("Your Numbers: 5, 12, 33, 47, 68", BLANK, false),
      field("Numbers Drawn: 3, 5, 9, 12, 14, 19, 22, 27, 31, 33, 38, 41, 45, 50, 56, 59, 63, 71, 74, 79", BLANK, false),
      field("Matches: 3/20"),
    ),
  ),
  inventory: reply("inventory", {
    color: OK,
    title: "SylveonDeko's Inventory",
    fields: [
      field(`${shopItem} x2`, `Consumable. Use it with \`use ${shopItem}\`.`),
      field("Golden Ticket x1", "No description."),
    ],
    footer: `Total spent: 1500 ${COIN}`,
  }),
  hit: reply(
    "hit",
    { embeds: blackjackTable("SylveonDeko drew a card!", "7♠️ K♥️", 17, "5♦️ 6♣️ 4♠️", 15) },
  ),
  highlow: reply("highlow higher 100", "Previous number: 4. Next number: 8. You guessed right! You won 100 🪙!"),
  gamestats: reply("gamestats", {
    color: OK,
    title: "Game performance, last 7 days",
    description:
      "RTP is what players actually got back per unit wagered. Above 100% means the game is printing currency.",
    fields: [
      field("coinflip", `RTP **96.0%**\nWagered 12500 ${COIN}\n48 plays by 6 players\nHouse take 500`),
      field("slots", `RTP **91.5%**\nWagered 8000 ${COIN}\n31 plays by 5 players\nHouse take 680`),
      field("blackjack", `RTP **98.2%**\nWagered 5400 ${COIN}\n19 plays by 4 players\nHouse take 97`),
    ],
    footer: `Net taken by the house across all games: 1277 ${COIN}`,
  }),
  economystats: reply("economystats", {
    color: OK,
    title: "Economy of The Deko Tree",
    fields: [
      field("Money Supply", `48,250 ${COIN}`),
      field("Holders", "12"),
      field("7-Day Change", `+3,120 ${COIN}`),
      field("In Wallets", `31,400 ${COIN}`),
      field("Banked", `16,850 ${COIN}`),
      field("Mean", `4,021 ${COIN}`),
      field("Median", `2,350 ${COIN}`),
      field("Gini", "0.412"),
      field("Top 10% Hold", "27.4%"),
    ],
    footer: "Gini runs 0 (everyone equal) to 1 (one person holds everything).",
  }),
  economyset: reply("economyset workcooldown 1800", confirm("`workcooldown` is now **1800**.")),
  economyreset: reply("economyreset", confirm("Economy settings restored to defaults.")),
  economyflow: reply("economyflow", {
    color: OK,
    title: "Where currency came from and went, last 7 days",
    fields: [
      field(
        "Faucets (currency created)",
        `\`Daily\` +12,400 ${COIN} (62)\n\`GamePayout\` +8,100 ${COIN} (130)\n\`Work\` +5,300 ${COIN} (41)\n`,
        false,
      ),
      field("Sinks (currency destroyed)", `\`GameBet\` -9,000 ${COIN} (132)\n\`TransferTax\` -250 ${COIN}\n`, false),
    ],
    footer: `Net change in supply: 16550 ${COIN}`,
  }),
  economyconfig: reply("economyconfig", {
    color: OK,
    title: "Economy settings for The Deko Tree",
    description: "Change any of these with `economyset <setting> <value>`.",
    fields: [
      field(
        "Betting",
        `\`gambling\` on\n\`minbet\` 1 ${COIN}\n\`maxbet\` unlimited\n\`payoutmultiplier\` 1.00x\n\`gamecooldown\` 0s\n\`losslimit\` off\n`,
      ),
      field("Transfers", `\`pay\` on\n\`paytax\` 0%\n\`paycooldown\` 0s\n\`payminimum\` 1 ${COIN}\n`),
      field("Bank", "`bank` on\n`bankcapacity` unlimited\n`bankinterest` 0%\n`bankinteresthours` 24h\n"),
      field(
        "Earning",
        "`work` on 50-250\n`workcooldown` 1800s\n`crime` on 200-800\n`crimechance` 45%\n`crimefine` 100-500\n`crimecooldown` 3600s\n",
      ),
      field(
        "Robbery",
        `\`rob\` on\n\`robchance\` 35%\n\`robmaxsteal\` 20%\n\`robfine\` 15%\n\`robminimum\` 100 ${COIN}\n\`robcooldown\` 3600s\n`,
      ),
      field("Daily", `\`dailystreak\` on\n\`dailystreakbonus\` 25 ${COIN}\n\`dailystreakmax\` unlimited\n`),
    ],
  }),
  duckrace: reply(
    "duckrace 100",
    game(
      GREEN,
      "🦆 Duck Race 🦆",
      `🎉 Your duck won! You won 100 ${COIN}!`,
      field("Your Duck: #🐤 (#3)"),
      field("Position: 2/5"),
      field("Race Results:\n1. 🦆 Duck #1\n2. 🐤 Duck #3 ⭐\n3. 🐥 Duck #2\n4. 🦢 Duck #5\n5. 🐣 Duck #4\n", BLANK, false),
    ),
  ),
  diceduel: chat(
    "general",
    sylveon(`diceduel ${MEMBER} 100`),
    bot(
      {
        color: ORANGE,
        title: "🎲 Dice Duel Challenge 🎲",
        description: `${AUTHOR} challenges ${MEMBER} to a dice duel for 100 ${COIN}!\n\n✅ Accept  ❌ Decline`,
      },
      [
        { emoji: "✅", count: 1 },
        { emoji: "❌", count: 1 },
      ],
    ),
    bot(game(GREEN, "🎲 Dice Duel Results 🎲", `🎉 ${MEMBER} wins with 5! ${AUTHOR} rolled 2.`)),
  ),
  deposit: reply("deposit 500", confirm(`Deposited 500 ${COIN} into your bank. It's safe from robbery there.`)),
  dailyreward: reply("dailyreward", confirm(`You claimed your daily reward of 200 ${COIN}!`)),
  dailychallenge: reply("dailychallenge", {
    color: BLUE,
    title: "🏆 Daily Challenge 🏆",
    description: "Win 3 currency games",
    fields: [field("Progress: 1/3"), field(`Reward: 213 ${COIN}`)],
  }),
  crime: reply(
    "crime",
    confirm(`You cracked the vault while the guard was on break. You got away with 412 ${COIN}.`),
  ),
  crash: reply(
    "crash 100 2",
    game(
      GREEN,
      "💥 Crash Game 💥",
      `🚀 Reached x2! You won 100 ${COIN}!`,
      field("Target: x2.00x"),
      field("Actual: x2.74x"),
    ),
  ),
  craps: reply(
    "craps 100 pass",
    game(
      GREEN,
      "🎲 Craps 🎲",
      undefined,
      field("Rolled: 4 + 3 = 7", BLANK, false),
      field("Result", "Natural 7!", false),
      field("Outcome", `Pass Line Win! You won 100 ${COIN}!`, false),
    ),
  ),
  coinflip: reply("coinflip 100 heads", `It was heads! You won 100 ${COIN}!`),
  claimchallenge: reply("claimchallenge", confirm(`${you} 🎉 Claimed! You earned 213 ${COIN}!`)),
  challengeleaderboard: reply("challengeleaderboard", {
    color: GOLD,
    title: "🏆 Daily Challenge Leaderboard",
    description: "Top challenge completers (Last 30 days)",
    fields: [
      field("🥇 SylveonDeko", "1. SylveonDeko - 12 completed"),
      field("🥈 Biscuit", "2. Biscuit - 9 completed"),
      field("🥉 Pixel", "3. Pixel - 4 completed"),
    ],
  }),
  cashleaderboard: reply("cashleaderboard", {
    color: OK,
    title: "Leaderboard",
    description: "Top 12 users in The Deko Tree",
    fields: [
      field("1. SylveonDeko", `3450 ${COIN}`),
      field("2. Biscuit", `2910 ${COIN}`),
      field("3. Pixel", `1875 ${COIN}`),
      field("4. Waffles", `1200 ${COIN}`),
    ],
    footer: "Page 1/2",
  }),
  cash: reply("cash", confirm(`Wallet: 2450 ${COIN}\nBank: 1000 ${COIN}\nNet worth: 3450`)),
  buy: reply(`buy ${shopItem}`, confirm(`Bought **${shopItem}** for 250 ${COIN}.`)),
  blackjack: reply(
    "blackjack 100",
    { embeds: blackjackTable("SylveonDeko joined the game!", "9♣️ 7♦️", 16, "A♠️ 6♥️", 17) },
  ),
  bingo: reply(
    "bingo 100",
    game(
      GREEN,
      "🎱 Bingo 🎱",
      `🎉 BINGO! You won 100 ${COIN}!`,
      field("Card Type: SMALL"),
      field("Called Numbers: 12, 45, 7, 21, 9, 30, 52, 68, 3", BLANK, false),
      field("Your Card:\n12✅ 45✅ 07✅ \n33❌ 21✅ 60❌ \n58❌ 09✅ 71❌ \n", BLANK, false),
    ),
  ),
  bank: reply("bank", {
    color: OK,
    title: "SylveonDeko's Bank",
    fields: [field("Wallet", `2,450 ${COIN}`), field("Bank", `1,000 ${COIN}`), field("Net Worth", `3,450 ${COIN}`)],
  }),
  baccarat: reply(
    "baccarat 100 player",
    game(
      GREEN,
      "🎰 Baccarat 🎰",
      undefined,
      field("Player Hand", "9♣️ K♦️ (Total: 9)", false),
      field("Banker Hand", "4♠️ 3♥️ (Total: 7)", false),
      field("Result", "Player Wins! Total: 9", false),
      field("Special", "Natural 9!", false),
      field("Outcome", `Player bet wins! You won 95 ${COIN}!`, false),
    ),
  ),
  horserace: chat(
    "general",
    sylveon("horserace 100"),
    bot(confirm(`${you} You have joined the race with a bet of 100!`)),
    bot({
      color: NONE,
      title: "🏆 Race Finished! 🏆",
      description: "The winner is SylveonDeko!",
      fields: [
        field("1. 🐎 SylveonDeko", "Winnings: 182", false),
        field("2. 🦛 AI Player 2", "Winnings: 109", false),
        field("3. 🐪 Biscuit", "Winnings: 73", false),
        field("4. 🦏 AI Player 1", "Winnings: 0", false),
        field("5. 🐘 AI Player 3", "Winnings: 0", false),
      ],
    }),
    bot(confirm(`${you} SylveonDeko won 182 from the race!`)),
    bot(confirm(`${you} AI Player 2 won 109 from the race!`)),
    bot(confirm(`${you} Biscuit won 73 from the race!`)),
  ),
};
