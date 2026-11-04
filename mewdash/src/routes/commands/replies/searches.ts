import { ago, type ChatEmbed } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, MEMBER, OK, USERNAME, bot, chat, confirm, reply, sylveon, type CommandPreview } from "./chat";

/** `ReplyConfirmAsync`: the confirm embed led by the bolded caller. */
const replyOk = (description: string) => confirm(`**${USERNAME}** ${description}`);

/** An action command aimed at the second member. */
const action = (name: string, verb: string): CommandPreview =>
  reply(`${name} ${MEMBER}`, { color: OK, description: `${AUTHOR} ${verb} ${MEMBER}` });

/** A random image from a subreddit, with the image itself left out. */
const redditPost = (name: string, subreddit: string, author: string, title: string, upvotes: number): CommandPreview =>
  reply(name, {
    color: OK,
    author: `u/${author}`,
    description: `Title: ${title}\n[Source](https://reddit.com/r/${subreddit}/comments/1a2b3c)`,
    footer: `${upvotes} Upvotes! | r/${subreddit} Powered by martineAPI`,
  });

const reverseLinks = (url: string) =>
  `Google: [Link](https://images.google.com/searchbyimage?image_url=${url})\nTinEye: [Link](https://www.tineye.com/search?url=${url})\nYandex: [Link](https://yandex.com/images/search?url=${url}&rpt=imageview)`;

const mcStatus = (name: string, address: string): ChatEmbed => ({
  color: OK,
  title: `${name} — ${address}:25565`,
  description: "Welcome to the Deko Tree survival server",
  fields: [
    { name: "Version", value: "1.21.4", inline: true },
    { name: "Players", value: "3/50", inline: true },
    { name: "Latency", value: "42ms", inline: true },
    { name: "Map", value: "world", inline: true },
    { name: "Game Mode", value: "survival", inline: true },
    { name: "Software", value: "Paper", inline: true },
    { name: "Online Players", value: "SylveonDeko, Biscuit, Marshmallow" },
    { name: "Plugins", value: "EssentialsX, LuckPerms, WorldEdit" },
  ],
  footer: "Last checked",
  timestamp: "Today at 6:12 PM",
});

const osuTop = (map: string, id: number, pp: string, acc: string, mods = ""): { name: string; value: string } => ({
  name: map,
  value: `[/b/${id}](https://osu.ppy.sh/b/${id})\n${pp}pp | ${acc}%${mods ? `\n**${mods}**` : ""}`,
});

const languageTable = [
  "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en",
]
  .map((code, i) => code.padEnd(15) + ((i + 1) % 3 === 0 ? "\n" : ""))
  .join("");

const streamPlaceholders = [
  "`%stream.name%` - Display name of the streamer",
  "`%stream.username%` - Login name/username of the streamer",
  "`%stream.url%` - Direct URL to the stream",
  "`%stream.title%` - Current stream title",
  "`%stream.game%` - Game/category being streamed",
  "`%stream.viewers%` - Current viewer count (- if offline)",
  "`%stream.platform%` - Platform name (Twitch, YouTube, etc.)",
  "`%stream.avatar%` - URL to streamer's avatar",
  "`%stream.preview%` - URL to stream preview/thumbnail",
  "`%stream.status%` - 🟢 Online or 🔴 Offline",
  "`%stream.channelid%` - Platform-specific channel ID",
].join("\n");

const xkcd = (name: string): CommandPreview =>
  reply(name, {
    color: OK,
    author: "Standards",
    fields: [
      { name: "Comic #", value: "927", inline: true },
      { name: "Date", value: "7/2011", inline: true },
      { name: "Alt", value: "Fortunately, the charging one has been solved now that everyone agrees on one plug." },
    ],
  });

const wotdEmbed: ChatEmbed = {
  color: OK,
  title: "📖 Word of the Day, November 3, 2026",
  description: "**ephemeral**  /ɪˈfɛm(ə)rəl/  *adjective*",
  fields: [
    { name: "Definition", value: "Lasting for a very short time." },
    { name: "Example", value: "*Autumn leaves are beautiful but ephemeral.*" },
  ],
  footer: "Powered by Datamuse and the Free Dictionary API",
};

const wotdConfirm = (name: string, description: string): CommandPreview => reply(name, confirm(description));

export const searchesPreviews: Record<string, CommandPreview> = {
  meme: reply("meme", {
    color: OK,
    author: "u/pixelpioneer",
    description: "Title: When the build passes on the first try\n[Source](https://reddit.com/r/ProgrammerHumor/comments/1a2b3c)",
    footer: "48213 Upvotes 412 Downvotes | r/ProgrammerHumor | Powered by MartineApi",
  }),
  randomreddit: redditPost("randomreddit sylveon", "sylveon", "ribbonfan", "Finally finished my Sylveon plush", 3421),
  randomcat: redditPost("randomcat", "cats", "whiskerwatcher", "He decided my keyboard was a bed", 9120),
  randomdog: redditPost("randomdog", "dogs", "fetchfriend", "Zoomies after the first snow", 7304),
  randomfood: redditPost("randomfood", "food", "panfriedpete", "Homemade ramen after three tries", 5188),
  randombird: redditPost("randombird", "birb", "featherfinder", "This sparrow posed for me", 2650),
  rip: chat(
    "general",
    sylveon(`rip ${MEMBER}`),
    bot(`Rip **Biscuit**\n\t- *${USERNAME}*`),
  ),
  weather: reply("weather Tokyo", {
    color: OK,
    title: "☀️ Weather for Tokyo, Japan",
    description:
      "Clear sky • Updated at 18:00\n\n🌡️ **18.4°C** (65.1°F)\n🤔 Feels like: 17.2°C (63.0°F)\n💧 Humidity: 58%\n💦 Dewpoint: 10.1°C\n\n💨 Wind speed: 11.2 km/h (240°)\n💨 Wind gusts: 24.5 km/h\n📊 Pressure: 1014.6 hPa\n☁️ Cloud cover: 12%\n👁️ Visibility: 24.1 km\n\n☀️ UV Index: 3.4\n🌞 Solar Radiation: 312 W/m²\n\n🌡️ Soil Temperature: 16.8°C\n💧 Soil Moisture: 31.2%",
    fields: [
      {
        name: "7-Day Outlook",
        value:
          "`Today    ` 19.8°/12.4°C\n`Tomorrow ` 21.0°/13.1°C • 0.4mm\n`Thu      ` 22.3°/14.0°C\n`Fri      ` 20.6°/15.2°C • 3.2mm\n`Sat      ` 18.9°/13.7°C • 6.8mm\n`Sun      ` 19.5°/12.9°C\n`Mon      ` 21.7°/13.3°C • UV Index: 5.6",
      },
    ],
    footer: "Powered by Open-Meteo.com",
  }),
  time: reply("time Tokyo", {
    color: OK,
    title: "Time",
    description: "`7:12:44 AM`",
    fields: [
      { name: "Location", value: "Tokyo\nJapan", inline: true },
      { name: "Timezone", value: "Japan Standard Time", inline: true },
    ],
  }),
  youtube: reply("youtube lofi study mix", {
    color: "#ff0000",
    author: "YouTube Search for lofi study mix",
    title: "lofi study mix for deep focus",
    description: "Two hours of calm beats to keep you company while you work or study.",
  }),
  movie: reply("movie Spirited Away", {
    color: OK,
    title: "Spirited Away",
    description:
      "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches and spirits.",
    fields: [{ name: "Year", value: "2001", inline: true }],
  }),
  image: reply("image red panda", {
    color: OK,
    author: "Image Result from Google",
    description: "Red panda resting on a branch",
    footer: "Page 1/20",
  }),
  shorten: reply("shorten https://example.com/docs/getting-started/with-a-very-long-path", {
    color: OK,
    fields: [
      { name: "Original url", value: "https://example.com/docs/getting-started/with-a-very-long-path" },
      { name: "Short url", value: "https://goolnk.com/aB3dE" },
    ],
  }),
  google: reply("google vaporeon", {
    color: OK,
    author: "Search for: vaporeon",
    title: USERNAME,
    description:
      "[Vaporeon | Pokemon Database](https://pokemondb.example/pokedex/vaporeon)\nVaporeon is a Water-type Pokemon known for melting into water.\n\n[Vaporeon - Pokemon Wiki](https://wiki.example/Vaporeon)\nVaporeon is a Water-type Pokemon introduced in Generation I.\n\n[Vaporeon Pokedex entry](https://pokedex.example/vaporeon)\nIts cell structure is similar to the molecular composition of water.",
    footer: "About 4,210,000 results (0.42 seconds)",
  }),
  urbandict: reply("urbandict touch grass", {
    color: OK,
    author: "touch grass",
    description: "An instruction to go outside and spend some time away from the screen.",
    footer: "Page 1/10",
  }),
  define: reply("define ubiquitous", {
    color: OK,
    description: AUTHOR,
    fields: [
      { name: "Word", value: "ubiquitous", inline: true },
      { name: "Class", value: "adjective", inline: true },
      { name: "Definition", value: "present, appearing or found everywhere" },
      { name: "Example", value: "Mobile phones are now ubiquitous." },
    ],
    footer: "Page 1/3",
  }),
  catfact: reply("catfact", confirm("Cats sleep for around 13 to 16 hours every day.", "🐈fact")),
  revav: reply(`revav ${MEMBER}`, confirm(reverseLinks("https://cdn.mewdeko.tech/avatars/biscuit.png"))),
  revimg: reply("revimg https://cdn.mewdeko.tech/example.png", confirm(reverseLinks("https://cdn.mewdeko.tech/example.png"))),
  safebooru: reply("safebooru sylveon", {
    color: OK,
    description: `${AUTHOR} [sylveon](https://safebooru.org/images/1234/sylveon.png)`,
    footer: "Safebooru",
  }),
  wiki: reply("wiki Sylveon", "https://en.wikipedia.org/wiki/Sylveon"),
  wikia: reply(
    "wikia starwars Darth Vader",
    "`Title:` Darth Vader\n`Url:` https%3A%2F%2Fstarwars.fandom.com%2Fwiki%2FDarth%20Vader",
  ),
  bible: reply("bible John 3:16", {
    color: OK,
    title: "John 3:16",
    description:
      "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
  }),
  steam: reply("steam Portal 2", {
    color: OK,
    title: "Portal 2",
    description: "The sequel to the acclaimed Portal, with new puzzle mechanics and a story of its own.",
    fields: [
      { name: "💰 Price", value: "$9.99", inline: true },
      { name: "🎮 Platforms", value: "Windows, macOS, Linux", inline: true },
      { name: "📅 Release Date", value: "Apr 18, 2011", inline: true },
      { name: "👥 Developer", value: "Valve", inline: true },
      { name: "🏷️ Categories", value: "Single-player, Multi-player, Co-op", inline: true },
      { name: "📊 Metacritic", value: "95/100", inline: true },
    ],
    footer: "Page 1/6",
  }),
  resolvetonetags: reply("resolvetonetags /s", {
    color: OK,
    title: "/s",
    description: "Indicates the statement is sarcastic in nature.",
    fields: [
      { name: "Source", value: "[CottageDwellingCat](https://github.com/CottageDwellingCat/)" },
      { name: "Aliases", value: "Sarcasm, Sarcastic, s, sarc" },
    ],
    footer:
      "If you want to add tonetags to mewdeko, or implement our tonetag searching in your own project check out CottageDwellingCat's tonetag json at https://github.com/CottageDwellingCat/tone-tags",
  }),
  ship: reply(`ship ${MEMBER}`, {
    color: "#000000",
    description:
      "You are 85% compatible. Horoscopes conclude that today will be a good day.. And that you two will get a room together soon",
  }),
  randomneko: reply("randomneko", { color: OK, description: "nya~ [Source](https://nekos.best/api/v2/neko)" }),
  randomkitsune: reply("randomkitsune", { color: OK, description: "What does the fox say? [Source](https://nekos.best/api/v2/kitsune)" }),
  randomwaifu: reply("randomwaifu", { color: OK, description: "Ara Ara~ [Source](https://nekos.best/api/v2/waifu)" }),
  mal: reply("mal Biscuit", {
    color: OK,
    title: "Biscuit's MAL profile",
    description: "** https://myanimelist.net/animelist/Biscuit **\n\n**Top 3 favorite anime**\n[Frieren](https://myanimelist.net/anime/52991)\n[Mushishi](https://myanimelist.net/anime/457)\n[Monster](https://myanimelist.net/anime/19)",
    fields: [
      { name: "💚 Watching", value: "8", inline: true },
      { name: "💙 Completed", value: "214", inline: true },
      { name: "💔 Dropped", value: "6", inline: true },
      { name: "⚪ Plan to watch", value: "57", inline: true },
      { name: "🕐 Days", value: "62.3", inline: true },
      { name: "📊 Mean Score", value: "7.84", inline: true },
      { name: "🚁 Gender", value: "Female", inline: true },
      { name: "🗺 Location", value: "Ohio", inline: true },
      { name: "👥 Last Online", value: "Now", inline: true },
    ],
  }),
  findanime: reply("findanime https://cdn.mewdeko.tech/screenshot.png", {
    color: OK,
    fields: [
      { name: "English Title", value: "Frieren: Beyond Journey's End" },
      { name: "Japanese Title", value: "葬送のフリーレン" },
      { name: "Romanji Title", value: "Sousou no Frieren" },
      { name: "Air Start Date", value: "2023-9-29" },
      { name: "Air End Date", value: "2024-3-22" },
      { name: "Season Number", value: "1" },
      { name: "Episode", value: "12" },
      { name: "AniList Link", value: "https://anilist.co/anime/154587" },
      { name: "MAL Link", value: "https://myanimelist.net/anime/52991" },
      { name: "Score", value: "91" },
      { name: "Description", value: "The demon king has been defeated, and the victorious hero party returns home before disbanding." },
    ],
  }),
  charinfo: reply("charinfo Frieren", {
    color: OK,
    fields: [
      { name: "Full Name", value: "Frieren" },
      { name: "Alternative Names", value: "Frieren the Slayer" },
      { name: "Native Name", value: "フリーレン" },
      { name: "Description/Backstory", value: "An elven mage who was part of the hero party that defeated the demon king." },
    ],
  }),
  anime: reply("anime Frieren", {
    color: OK,
    title: "Sousou no Frieren",
    description: "After the demon king is defeated, the elven mage Frieren sets out to understand the humans she traveled with.",
    fields: [
      { name: "Genres", value: "Adventure, Drama, Fantasy", inline: true },
      { name: "Episodes", value: "28", inline: true },
      { name: "Score", value: "9.3", inline: true },
      { name: "Status", value: "Finished Airing", inline: true },
      { name: "Type", value: "TV", inline: true },
      { name: "Start Date", value: ago(94608000), inline: true },
      { name: "End Date", value: ago(78840000), inline: true },
      { name: "Rating", value: "PG-13 - Teens 13 or older", inline: true },
      { name: "Rank", value: "1", inline: true },
      { name: "Popularity", value: "74", inline: true },
      { name: "Members", value: "1203421", inline: true },
      { name: "Favorites", value: "98211", inline: true },
      { name: "Source", value: "Manga", inline: true },
      { name: "Duration", value: "24 min per ep", inline: true },
      { name: "Studios", value: "Madhouse", inline: true },
      { name: "Producers", value: "Aniplex, Shogakukan", inline: true },
    ],
    footer: "Page 1/25",
  }),
  manga: reply("manga Monster", {
    color: OK,
    title: "**Monster**",
    description: "Dr. Kenzou Tenma saves a young boy's life and spends years paying for the choice.",
    fields: [
      { name: "First Publish Date", value: "Dec 5, 1994 to Dec 20, 2001" },
      { name: "Volumes", value: "18" },
      { name: "Is Still Active", value: "False" },
      { name: "Score", value: "9.15" },
      { name: "Url", value: "https://myanimelist.net/manga/1" },
    ],
    footer: "Page 1/25",
  }),
  feedadd: reply("feedadd https://example.com/feed.xml #general", replyOk("Feed added.")),
  feedremove: reply("feedremove 1", replyOk("Feed removed.")),
  feedmessage: reply("feedmessage 1 New post: %title% %url%", replyOk("Feed message updated.")),
  rsstest: reply("rsstest 1", {
    color: OK,
    title: "Release notes for version 2.4",
    description: "A new version is out with faster startup and a handful of fixes.",
    footer: "https://example.com/feed.xml",
  }),
  feedlist: reply("feedlist", {
    color: OK,
    description: "`1.` <#general> https://example.com/feed.xml\n`2.` <#general> https://example.org/blog/rss",
    footer: "Page 1/1",
  }),
  yomama: reply("yomama", confirm("Yo mama is so organized she alphabetizes her alphabet soup.")),
  randjoke: reply("randjoke", confirm("What do you call a fake noodle?", "An impasta.")),
  chucknorris: reply("chucknorris", confirm("Chuck Norris can win a game of Connect Four in three moves. 😆")),
  wowjoke: reply("wowjoke", confirm("Why did the paladin cross the road?", "To bubble hearth on the other side.")),
  magicitem: reply("magicitem", confirm("✨Bag of Holding", "Wondrous item, uncommon. This bag seems ordinary but is larger on the inside.")),
  memelist: reply("memelist", {
    color: OK,
    description: "**Drake Hotline Bling:**\n key: `drake`\n**Distracted Boyfriend:**\n key: `db`\n**Two Buttons:**\n key: `ds`\n**Change My Mind:**\n key: `cmm`\n",
    footer: "Page 1/12",
  }),
  memegen: reply("memegen drake No tests;Tests", "https://api.memegen.link/drake/No-tests/Tests.png"),
  osu: reply("osu peppy", {
    color: OK,
    title: "osu! Standard profile for peppy",
    description: "https://osu.ppy.sh/u/2",
    fields: [
      { name: "Official Rank", value: "#1204", inline: true },
      { name: "Country Rank", value: "#31 🇺🇸", inline: true },
      { name: "Total PP", value: "8421.55", inline: true },
      { name: "Accuracy", value: "98.42%", inline: true },
      { name: "Playcount", value: "124503", inline: true },
      { name: "Level", value: "102", inline: true },
    ],
  }),
  gatari: reply("gatari peppy", {
    color: OK,
    title: "osu! Gatari Standard profile for peppy",
    description: "https://osu.gatari.pw/u/1001",
    fields: [
      { name: "Official Rank", value: "#312", inline: true },
      { name: "Country Rank", value: "#9 🇺🇸", inline: true },
      { name: "Total PP", value: "7310", inline: true },
      { name: "Accuracy", value: "97.8%", inline: true },
      { name: "Playcount", value: "58210", inline: true },
      { name: "Level", value: "96", inline: true },
    ],
  }),
  osu5: reply("osu5 peppy", {
    color: OK,
    title: "Top 5 plays for peppy",
    fields: [
      osuTop("Camellia-Ghost (Extra)", 129891, "612.4", "99.12", "+HD"),
      osuTop("Nanairo-Skyline (Insane)", 331870, "588.9", "98.71", "+HDDT"),
      osuTop("Aoi-Harmony (Hard)", 845112, "571.2", "99.48"),
      osuTop("Kou-Starlight (Expert)", 112934, "560.0", "97.95", "+HR"),
      osuTop("Mizu-Lagoon (Insane)", 667401, "552.3", "98.33"),
    ],
  }),
  pokemon: reply("pokemon sylveon", {
    color: OK,
    title: "Sylveon",
    fields: [
      { name: "Abilities", value: "Cute-charm\nPixilate" },
      { name: "Forms", value: "Sylveon" },
      { name: "Base Stats", value: "hp: 95\nattack: 65\ndefense: 65\nspecial-attack: 110\nspecial-defense: 130\nspeed: 60" },
      { name: "Types", value: "Fairy" },
      { name: "Game Indices", value: "Black\nWhite\nBlack-2\nWhite-2\nX\nY\nOmega-ruby\nAlpha-sapphire\nSun\nMoon" },
      { name: "Moves", value: "Tackle\nTail-whip\nHelping-hand\nSand-attack\nGrowl\nBaby-doll-eyes\nQuick-attack\nSwift\nBite\nFairy-wind" },
    ],
    footer: "Page 1/8",
  }),
  streamadd: chat(
    "general",
    sylveon("streamadd https://twitch.tv/biscuit"),
    bot({
      text: "I will notify this channel whenever this stream comes online.",
      embeds: [
        {
          color: OK,
          author: "Cozy Sunday building",
          title: "Biscuit",
          description: "https://twitch.tv/biscuit",
          fields: [
            { name: "Status", value: "🟢 Online", inline: true },
            { name: "Viewers", value: "128", inline: true },
            { name: "Streaming", value: "Minecraft", inline: true },
          ],
        },
      ],
    }),
  ),
  streamremove: reply("streamremove 1", replyOk("Removed **biscuit**'s stream (Twitch) from notifications.")),
  streamsclear: reply("streamsclear", replyOk("All 3 followed streams on this community have been removed.")),
  streamlist: reply("streamlist", {
    color: OK,
    title: "Streams you're following",
    fields: [
      { name: "**#1** biscuit", value: "Twitch\n<#general>" },
      { name: "**#2** marshmallow", value: "Twitch\n<#general>" },
    ],
    footer: "Page 1/1",
  }),
  streamoffline: reply("streamoffline", replyOk("Stream notifications will now show when a stream goes offline.")),
  streammessage: reply("streammessage 1 %stream.name% is live!", replyOk("Announcement message when **biscuit** stream goes online has been set.")),
  streamofflinemessage: reply("streamofflinemessage 1 %stream.name% has ended the stream.", replyOk("Offline announcement message when **biscuit** stream goes offline has been set.")),
  streamtemplate: reply("streamtemplate", {
    color: OK,
    title: "Stream Notification Template",
    description: "No custom stream template is set. Using default embed format.",
    fields: [{ name: "Stream Information", value: streamPlaceholders }],
    footer: "Use 'streamtemplate reset' to disable custom templates. Supports JSON embed format.",
  }),
  streamcheck: reply("streamcheck https://twitch.tv/biscuit", replyOk("Streamer **Biscuit** is online with **128** viewers.")),
  translate: reply("translate en>ja good morning", confirm("おはようございます", "Translation: en>ja")),
  translangs: chat("general", sylveon("translangs"), bot(`\`\`\`css\n${languageTable}\n\`\`\``)),
  autotranslate: reply("autotranslate", replyOk("Started automatic translation of messages on this channel.")),
  autotranslang: reply("autotranslang en>ja", replyOk("Your auto-translate language has been set to en>ja")),
  xkcd: xkcd("xkcd 927"),
  wink: action("wink", "winks"),
  wave: action("wave", "waves"),
  tickle: action("tickle", "tickles"),
  thumbsup: action("thumbsup", "gives a thumbs-up"),
  think: action("think", "thinks"),
  stare: action("stare", "stares"),
  smug: action("smug", "is smug"),
  smile: action("smile", "smiles"),
  sleep: action("sleep", "sleeps"),
  slap: action("slap", "slapped"),
  shrug: action("shrug", "shrugs"),
  shoot: action("shoot", "shot"),
  punch: action("punch", "punched"),
  pout: action("pout", "pouts"),
  poke: action("poke", "poked"),
  pat: action("pat", "gave pattus to"),
  laugh: action("laugh", "laughs"),
  kiss: action("kiss", "Kissed"),
  hug: action("hug", "hugs"),
  highfive: action("highfive", "high-fives"),
  happy: action("happy", "is happy"),
  handhold: action("handhold", "handholds"),
  feed: action("feed", "is feeding"),
  facepalm: action("facepalm", "facepalms"),
  dance: action("dance", "dances"),
  cuddle: action("cuddle", "cuddles with"),
  cry: action("cry", "cries"),
  bored: action("bored", "is bored"),
  blush: action("blush", "blushes"),
  bite: action("bite", "bites"),
  baka: action("baka", "bakas"),

  mcstatus: reply("mcstatus survival", mcStatus("Deko Survival", "play.dekotree.net")),
  mcadd: reply("mcadd survival play.dekotree.net", confirm("Added Minecraft server **survival** (`play.dekotree.net:25565`).")),
  mcremove: reply("mcremove survival", confirm("Removed Minecraft server **survival**.")),
  mclist: reply("mclist", {
    color: OK,
    title: "Minecraft Servers",
    fields: [
      { name: "survival ⭐", value: "`play.dekotree.net:25565` (Java) 📡 <#general>", inline: true },
      { name: "creative", value: "`creative.dekotree.net:25565` (Java)", inline: true },
      { name: "pocket", value: "`pe.dekotree.net:19132` (Bedrock)", inline: true },
    ],
  }),
  mcdefault: reply("mcdefault survival", confirm("**survival** is now the default Minecraft server.")),
  mcwatch: reply("mcwatch survival #general", confirm("Now watching **survival** in <#general>.")),
  mcwatchmode: reply("mcwatchmode survival ChannelTopic", confirm("Watch mode for **survival** set to **ChannelTopic**.")),
  mcembed: reply("mcembed survival {title: %mc.name%}", confirm("Custom embed template set for **survival**.")),
  mcplayer: reply("mcplayer SylveonDeko", {
    color: OK,
    title: "SylveonDeko",
    fields: [{ name: "UUID", value: "`5f3c2a1e-9b7d-4c8e-a2f1-6d0e4b7c9a13`" }],
  }),
  mcskin: reply("mcskin SylveonDeko", { color: OK, title: "SylveonDeko's Skin" }),
  mcrcon: reply("mcrcon survival list", confirm("```\nThere are 3 of a max of 50 players online: SylveonDeko, Biscuit, Marshmallow\n```")),
  mcwhitelist: reply("mcwhitelist survival list", {
    color: OK,
    title: "Whitelist — survival",
    description: "SylveonDeko\nBiscuit\nMarshmallow",
    footer: "3 player(s)",
  }),

  wotd: reply("wotd", wotdEmbed),
  wotdtoggle: wotdConfirm("wotdtoggle", "📖 Word of the Day is enabled. Posting in <#general> at 09:00 (America/New_York)."),
  wotdchannel: wotdConfirm("wotdchannel #general", "📖 Daily words will be posted in <#general>."),
  wotdtime: wotdConfirm("wotdtime 9", "The daily word will post at 09:00 (America/New_York)."),
  wotdtimezone: wotdConfirm("wotdtimezone America/New_York", "Timezone set to **America/New_York**. It's currently 18:12 there."),
  wotdpingrole: wotdConfirm("wotdpingrole @Word Nerds", "@Word Nerds will be pinged with each daily word."),
  wotdmessage: reply(
    "wotdmessage",
    confirm(
      "Current template:\nDefault embed\n\nPlaceholders: `%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%`, `%wotd.ping%`. Embed JSON is supported. Send `wotdmessage clear` to go back to the default.",
    ),
  ),
  wotdtopic: wotdConfirm("wotdtopic nature", "Words will lean toward the topic **nature**."),
  wotdpos: wotdConfirm("wotdpos Noun", "Part of speech filter set to **Noun**."),
  wotddifficulty: wotdConfirm("wotddifficulty Rare", "Difficulty set to **Rare**."),
  wotdmode: wotdConfirm("wotdmode Mixed", "Word source set to **Mixed**."),
  wotdadd: wotdConfirm("wotdadd serendipity", "Added **serendipity** to the custom word list."),
  wotdremove: wotdConfirm("wotdremove serendipity", "Removed **serendipity** from the custom word list."),
  wotdlist: reply("wotdlist", {
    color: OK,
    title: "📚 Custom words (3)",
    description:
      "**serendipity** *(noun)*: The occurrence of fortunate events by chance.  `×2`\n**luminous** *(adjective)*: Full of or shedding light.  `×1`\n**meander** *(verb)*: To follow a winding course.  `×0`\n",
    footer: "Page 1/1",
  }),
  wotdhistory: reply("wotdhistory", {
    color: OK,
    title: "📖 Recent words of the day",
    description:
      "`2026-11-02` **petrichor** *(noun)*: The pleasant smell after rain falls on dry ground.\n`2026-11-01` **verdant** *(adjective)*: Green with grass or other lush vegetation.\n`2026-10-31` **phantasm** *(noun)*: A figure that appears in a dream or is imagined.\n",
  }),
  wotdconfig: reply("wotdconfig", {
    color: OK,
    title: "📖 Word of the Day Configuration",
    fields: [
      { name: "Status", value: "✅ Enabled", inline: true },
      { name: "Channel", value: "<#general>", inline: true },
      { name: "Post time", value: "09:00 America/New_York", inline: true },
      { name: "Ping role", value: "None", inline: true },
      { name: "Source", value: "Mixed (3 custom words)", inline: true },
      { name: "Topic", value: "nature", inline: true },
      { name: "Part of speech", value: "Any", inline: true },
      { name: "Difficulty", value: "Any", inline: true },
      { name: "Last posted", value: "2026-11-02", inline: true },
      { name: "Schedule rules", value: "2", inline: true },
      { name: "Discussion thread", value: "1 day, `Word of the day: %wotd.word%`", inline: true },
      { name: "Template", value: "Default embed" },
    ],
  }),
  wotdday: wotdConfirm("wotdday friday cooking", "🗓️ Rule for **Friday** saved: Topic: **cooking**"),
  wotddayfilter: wotdConfirm("wotddayfilter friday Verb Common", "🗓️ Rule for **Friday** saved: Part of speech: **Verb**, Difficulty: **Common**"),
  wotdmonth: wotdConfirm("wotdmonth march spring", "🗓️ Rule for **March** saved: Topic: **spring**"),
  wotdmonthfilter: wotdConfirm("wotdmonthfilter december Adjective Rare", "🗓️ Rule for **December** saved: Part of speech: **Adjective**, Difficulty: **Rare**"),
  wotdschedule: reply("wotdschedule", {
    color: OK,
    title: "🗓️ Word of the Day schedule",
    fields: [
      {
        name: "Today's effective filters",
        value: "Topic: **cooking**, Part of speech: **Any**, Difficulty: **Any** (from the **Tuesday** rule)",
      },
      { name: "Weekday rules", value: "**Tuesday**: Topic: **cooking**\n**Friday**: Part of speech: **Verb**, Difficulty: **Common**" },
      { name: "Month rules", value: "**December**: Part of speech: **Adjective**, Difficulty: **Rare**" },
    ],
  }),
  wotdthread: wotdConfirm("wotdthread", "🧵 A discussion thread will be created under each daily word."),
  wotdthreadname: wotdConfirm("wotdthreadname Word: %wotd.word%", "Thread name template saved: Word: %wotd.word%"),
  wotdthreadarchive: wotdConfirm("wotdthreadarchive 3d", "Threads will auto-archive after **3 days** of inactivity."),
  wotdpost: wotdConfirm("wotdpost", "Posted today's word: **ephemeral**."),
  wotdreset: chat(
    "general",
    sylveon("wotdreset"),
    bot(confirm("Reset all Word of the Day settings, custom words, and history for this community?")),
    bot(confirm("Word of the Day settings have been reset.")),
  ),
};
