import { ago, type ChatEmbed, type ChatReaction, type ChatTextMessage } from "$lib/components/chat-mock/fluxer/types";
import { AUTHOR, ERROR, MEMBER, OK, TIME, USERNAME, bot, chat, confirm, error, reply, sylveon, users, type CommandPreview } from "./chat";

type Reply = Parameters<typeof bot>[0];

/** `ReplyConfirmAsync`: the confirm embed led by the bold name of whoever ran the command. */
const by = (text: string) => confirm(`**${USERNAME}** ${text}`);

/** `ReplyErrorAsync`: the error embed led by the bold name of whoever ran the command. */
const byError = (text: string) => error(`**${USERNAME}** ${text}`);

const say = (author: "sylveon" | "member", text: string): ChatTextMessage => ({ author, time: TIME, text });

const inMusic = (input: string, ...responses: Reply[]) => chat("music", sylveon(input), ...responses.map((r) => bot(r)));

const fields = (...rows: [string, string, boolean?][]) => rows.map(([name, value, inline]) => ({ name, value, ...(inline ? { inline } : {}) }));

const GREEN = "#2ecc71";
const BLUE = "#3498db";
const PURPLE = "#9b59b6";
const DARK_GREY = "#607d8b";

const GIVEAWAY_ID = "1521570415726903298";
const GIVEAWAY_LINK = `https://web.fluxer.app/channels/1521568983961042950/1521568983961042951/${GIVEAWAY_ID}`;

const tracks = [
  { title: "Rainy Window Loop", artist: "Moss Lantern", id: "kT3vQe8LmZc", length: "00:03:12" },
  { title: "Midnight Bus Ride", artist: "Paper Satellites", id: "Hq7nVx2PdRw", length: "00:04:05" },
  { title: "Slow Kettle", artist: "Quiet Harbor", id: "Zb5mYc1TuNo", length: "00:02:48" },
  { title: "Neon Cartography", artist: "Glass Orchard", id: "Wd9fJk4RsAe", length: "00:03:37" },
  { title: "Porch Light Waltz", artist: "Moss Lantern", id: "Lp2xCv6GhQi", length: "00:03:51" },
];

const trackUrl = (index: number) => `https://www.youtube.com/watch?v=${tracks[index].id}`;
const trackLink = (index: number) => `[${tracks[index].title}](${trackUrl(index)})`;
const pickEntry = (index: number) => `\`${index + 1}.\` ${trackLink(index)} by ${tracks[index].artist}`;
const searchEntry = (index: number) =>
  `\`${index + 1}.\` ${trackLink(index)}\n⏱️ Duration: \`${tracks[index].length}\`\n👤 Artist: ${tracks[index].artist}`;
const queueEntry = (index: number) => `${index + 1}. ${trackLink(index)}\n\`${tracks[index].length} | ${USERNAME} | YouTube\``;

const progress = (done: number) => `${"━".repeat(done)}●${"─".repeat(19 - done)}`;

const nowPlaying = (index: number, state: string, position: string, bar: string, color: string, queueNumber: number): ChatEmbed => ({
  color,
  title: "Now Playing",
  description:
    `**${trackLink(index)}**\n${tracks[index].artist}\n🎵 YouTube • 👤 ${USERNAME}\n\n` +
    `${state} \`${position}\` ${bar} \`${tracks[index].length.slice(3)}\`\n\n` +
    `🔊 **80%** • 📑 **${queueNumber}** of **5**`,
  footer: "Control playback with the pause, skip, volume, loop and queue commands.",
});

const lastFmUrl = (index: number) => `https://www.last.fm/music/${tracks[index].artist.replace(" ", "+")}/_/${tracks[index].title.replaceAll(" ", "+")}`;
const artistUrl = (name: string) => `https://www.last.fm/music/${name.replace(" ", "+")}`;
const FM_USER = "sylveon_fm";

const whoKnows = (title: string): ChatEmbed => ({
  color: OK,
  title,
  description: "1. **<@sylveon>**, 412 plays\n2. **<@member>**, 288 plays",
});

const linux = (g: string, l: string) =>
  `I'd just like to interject for moment. What you're refering to as ${l}, is in fact, ${g}/${l}, or as I've recently taken to calling it, ${g} plus ${l}. ${l} is not an operating system unto itself, but rather another free component of a fully functioning ${g} system made useful by the ${g} corelibs, shell utilities and vital system components comprising a full OS as defined by POSIX.\n\n` +
  `Many computer users run a modified version of the ${g} system every day, without realizing it. Through a peculiar turn of events, the version of ${g} which is widely used today is often called ${l}, and many of its users are not aware that it is basically the ${g} system, developed by the ${g} Project.\n\n` +
  `There really is a ${l}, and these people are using it, but it is just a part of the system they use. ${l} is the kernel: the program in the system that allocates the machine's resources to the other programs that you run. The kernel is an essential part of an operating system, but useless by itself; it can only function in the context of a complete operating system. ${l} is normally used in combination with the ${g} operating system: the whole system is basically ${g} with ${l} added, or ${g}/${l}. All the so-called ${l} distributions are really distributions of ${g}/${l}.`;

const HANGMAN = [". ┌─────┐", ".┃...............┋", ".┃...............┋", ".┃", ".┃", ".┃", "/-\\"].join("\n");

const TYPING_SENTENCE = "The quick brown fox jumps over the lazy dog while the river hums below.";

const KALADONT_RULES =
  "**Rules:**\n• Each word must start with the last 2 letters of the previous word\n• Words cannot be repeated\n• No loops (word can't start and end with same 2 letters)\n• You have 30 seconds per turn";

const pollField = (name: string) => ({ name, value: "░░░░░░░░░░\n0 votes (0.0%)", inline: true });

const poll = (icon: string, question: string, color: string, options: string[], footer: string): ChatEmbed => ({
  color,
  title: `${icon} ${question}`,
  fields: options.map(pollField),
  footer: `${footer} • Poll ID: 12`,
});

const pollReactions = (...emojis: string[]): ChatReaction[] => emojis.map((emoji) => ({ emoji, count: 1, me: true }));

const SNACKS = ["1️⃣ Chips", "2️⃣ Popcorn", "3️⃣ Candy"];
const SNACK_REACTIONS = pollReactions("1️⃣", "2️⃣", "3️⃣");

const giveaway = (): ChatEmbed => ({
  color: OK,
  title: "Mystery Box",
  description: `React with 🎉 to enter!\nHosted by ${AUTHOR}\nEnd Time: <t:3600:R>\n`,
  footer: "1 Winners | The Deko Tree Giveaways | Ends on 03.11.2026",
});

const winnerAnnouncement = (): ChatTextMessage =>
  bot({
    text: `Congratulations to ${MEMBER}! 🎉`,
    embeds: [
      {
        color: ERROR,
        description: `${MEMBER} won the giveaway for [Mystery Box](${GIVEAWAY_LINK})! \n\n- (Hosted by: ${AUTHOR})\n- Reroll: \`.reroll ${GIVEAWAY_ID}\``,
      },
    ],
  });

const settingsFooter = "Just keep in mind this doesn't update until the next giveaway.";

export const entertainmentPreviews: Record<string, CommandPreview> = {
  choose: reply("choose pizza; tacos; sushi", confirm("🤔 tacos")),
  eightball: reply("8ball Will the movie night be a hit?", {
    color: OK,
    description: USERNAME,
    fields: fields(["❓ Question", "Will the movie night be a hit?"], ["🎱 8ball", "Most definitely yes."]),
  }),
  rategirl: reply("rategirl", error("This command contains inappropriate content and has been disabled.")),
  linux: reply("linux GNU Linux", confirm(linux("GNU", "Linux"))),
  dragon: reply("dragon", by("You are now an all powerful dragon goddess")),
  acrophobia: reply("acro", {
    color: OK,
    title: "Acrophobia",
    description: "Game started. Create a sentence with the following acronym: **R.T.F.M**.",
    footer: "You have 60 seconds to make a submission.",
  }),
  hangman: reply("hangman countries", confirm(`\` ◯ ◯ ◯ ◯ ◯ ◯\`\n${HANGMAN}`, "Hangman game started (Countries)")),
  hangmanlist: reply("hangmanlist", confirm('`List of ".hangman" term types:`\nanimals\ncountries\nmovies\nthings')),
  hangmanstop: reply("hangmanstop", by("Hangman game stopped.")),
  kaladont: chat("general", sylveon("kaladont"), bot(
    {
      color: OK,
      title: "🎮 Kaladont",
      description: "Kaladont game is starting! React with ✅ to join. (15s remaining)\n\nMinimum players: 2",
      fields: fields([KALADONT_RULES, "​"]),
      footer: "Language: EN | Mode: 🎯 Normal | Join time: 15s",
    },
    [{ emoji: "✅", count: 1, me: true }],
  )),
  kaladontsetup: reply("kaladontsetup", {
    color: OK,
    title: "🎮 Kaladont Channel Active!",
    description: "**Language:** EN | **Mode:** 🎯 Normal",
    fields: fields(["▶️ CURRENT WORD", "# TABLE"], ["Next must start with", "**LE**", true], ["How to Play", "Type a valid word to join!", true]),
  }),
  kaladontdisable: reply("kaladontdisable", by("Kaladont channel has been disabled.")),
  kaladontstop: reply("kaladontstop", by("Kaladont game has been stopped.")),
  nunchi: chat("general", sylveon("nunchi"), bot(confirm("Nunchi game created. Waiting for users to join.")), say("member", ".nunchi"), bot(confirm("**Biscuit** Joined nunchi game. 2 users joined so far."))),
  tictactoe: reply("tictactoe", by("has created a game of TicTacToe.")),
  trivia: reply("trivia", {
    color: OK,
    title: "Trivia Game",
    fields: fields(["Category", "Science"], ["Question", "What is the only planet in the solar system that rotates on its side?"]),
    footer: "You can stop trivia by typing .tq",
  }),
  tl: reply("tl", confirm("**SylveonDeko** has 3 points\n**Biscuit** has 1 point", "Leaderboard")),
  tq: reply("tq", confirm("Stopping after this question.", "Trivia Game")),
  typestart: chat("general", sylveon("typestart"), bot(confirm("🕑 Next contest will last for 26 seconds. Type the bolded text as fast as you can.")), bot(TYPING_SENTENCE)),
  typestop: reply("typestop", confirm("Typing contest stopped.")),
  typeadd: reply(`typeadd ${TYPING_SENTENCE}`, confirm("Added new article for typing game")),
  typelist: reply("typelist", confirm("List of articles for type race:\n`#1` - The quick brown fox jumps over the lazy dog…\n`#2` - Pack my box with five dozen liquor jugs…")),
  typedel: reply("typedel 2", { color: OK, title: "Removed typing article #2", description: "Pack my box with five dozen liquor jugs…" }),

  poll: chat("general", sylveon("poll Should we have a movie night?"), bot(
    poll("✅❌", "Should we have a movie night?", GREEN, ["✅ Yes", "❌ No"], "React to vote"),
    pollReactions("✅", "❌"),
  )),
  pollc: chat("general", sylveon("pollc Best snack?;Chips;Popcorn;Candy"), bot(
    poll("📊", "Best snack?", BLUE, SNACKS, "React to vote"),
    SNACK_REACTIONS,
  )),
  pollm: chat("general", sylveon("pollm Which snacks should we get?;Chips;Popcorn;Candy"), bot(
    poll("☑️", "Which snacks should we get?", PURPLE, SNACKS, "React with every option you pick"),
    SNACK_REACTIONS,
  )),
  polla: chat("general", sylveon("polla Best snack?;Chips;Popcorn;Candy"), bot(
    poll("🔒", "Best snack?", DARK_GREY, SNACKS, "Votes are anonymous: your reaction disappears once it is counted"),
    SNACK_REACTIONS,
  )),
  pollstats: reply("pollstats 12", {
    color: OK,
    title: "📊 Poll Statistics: Should we have a movie night?",
    fields: fields(
      ["Status", "Active", true],
      ["Total Votes", "5", true],
      ["Unique Voters", "5", true],
      ["Created", "2026-11-03 17:12", true],
      ["Average Vote Time", "2 minutes, 14 seconds", true],
      ["Results", "✅ Yes: 4 votes (80.0%)\n❌ No: 1 votes (20.0%)"],
    ),
  }),
  pollclose: reply("pollclose 12", confirm("Poll **Should we have a movie night?** has been closed.")),
  polldelete: reply(
    "polldelete 12",
    confirm("Delete the poll **Should we have a movie night?**, its votes and its message? This cannot be undone."),
    confirm("Poll deleted successfully."),
  ),
  polllist: reply("polllist", {
    color: OK,
    title: "📊 Active Polls",
    description: "Found 2 active poll(s)",
    fields: fields(
      ["Should we have a movie night?", `**Channel:** <#general>\n**Votes:** 5\n**Created:** ${ago(3600)}\n**ID:** 12`, true],
      ["Best snack?", `**Channel:** <#general>\n**Votes:** 2\n**Created:** ${ago(900)}\n**ID:** 13`, true],
    ),
  }),
  polltemplates: reply("polltemplates", {
    color: BLUE,
    title: "📋 Poll Templates",
    description: "Found 2 template(s)",
    fields: fields(
      ["movienight", "**Question:** Movie night this Friday?\n**Options:** 3\n**Created:** 2026-10-14", true],
      ["snacks", "**Question:** Best snack?\n**Options:** 3\n**Created:** 2026-10-21", true],
    ),
  }),
  polltemplatecreate: reply("polltemplatecreate movienight;Movie night this Friday?;Yes;No;Maybe", {
    color: OK,
    title: "Template Created",
    description: "Successfully created template **movienight**",
    fields: fields(["Question", "Movie night this Friday?"], ["Options", "Yes, No, Maybe"]),
  }),
  polltemplate: chat("general", sylveon("polltemplate snacks"), bot(poll("📊", "Best snack?", BLUE, SNACKS, "React to vote"), SNACK_REACTIONS)),
  polltemplatedelete: reply("polltemplatedelete movienight", confirm("Template **movienight** has been deleted.")),

  votechannel: reply("votechannel #votes", confirm("Successfully set the vote channel!")),
  votemessage: reply("votemessage Thanks for voting, %user.mention%! You now have %votestotalcount% votes.", confirm("Vote message set.")),
  votepassword: reply(
    "votepassword",
    confirm("Please make absolute sure nobody else sees this password, otherwise this will lead to improper data. ***Mewdeko and it's team are not responsible for stolen passwords***. \n\nDo you agree to these terms?"),
    confirm("Send the new vote password as your next message within 60 seconds. I will delete it right away."),
    confirm("Vote password set."),
  ),
  voteroleadd: reply("voteroleadd @Voter 12h", confirm("@Voter added as a vote role and will last 12 hours when a person votes.")),
  voteroleremove: reply("voteroleremove @Voter", confirm("Vote role removed.")),
  voteroleedit: reply("voteroleedit @Voter 1d", confirm("Successfuly updated the vote role time to 1 day")),
  voteroleslist: reply("voteroleslist", { color: OK, title: "2 Vote Roles", description: "@Voter: 12 hours\n@Supporter: None" }),
  voterolesclear: reply(
    "voterolesclear",
    confirm("Are you sure you want to clear all vote roles? This cannot be undone!"),
    confirm("Vote roles cleared!"),
  ),
  votes: reply("votes", {
    color: OK,
    title: "Vote Stats for The Deko Tree",
    thumbnail: { src: users.sylveon.avatar, width: 128, height: 128 },
    fields: fields(["Votes this month", "4"], ["Total Votes", "17"]),
    footer: `${USERNAME} | 1521568983961042950`,
  }),
  votesleaderboard: reply("votesleaderboard", {
    color: OK,
    title: "Votes Leaderboard",
    fields: fields(["#1 SylveonDeko", "17"], ["#2 Biscuit", "9"]),
  }),

  gstart: chat("general", sylveon("gstart #general 1h 1 Mystery Box"), bot(giveaway(), pollReactions("🎉")), bot(confirm("Giveaway started in <#general>"))),
  gend: chat("general", sylveon(`gend ${GIVEAWAY_ID}`), winnerAnnouncement(), bot(confirm("Giveaway has been ended successfully!"))),
  greroll: chat("general", sylveon(`greroll ${GIVEAWAY_ID}`), winnerAnnouncement(), bot(confirm("Giveaway has been rerolled successfully."))),
  glist: reply("glist", {
    color: OK,
    title: "1 Active Giveaways",
    description: `Message ID: ${GIVEAWAY_ID}\nPrize: Mystery Box\nWinners: 1\nLink: ${GIVEAWAY_LINK}`,
  }),
  gstats: reply("gstats", {
    color: OK,
    title: "Giveaway Statistics!",
    fields: fields(
      ["Amount of users that started giveaways", "3", true],
      ["Total amount of giveaways", "9", true],
      ["Active Giveaways", "1", true],
      ["Ended Giveaways", "8", true],
      ["Giveaway Channels: Uses", "<#giveaways>: 7\n<#general>: 2", true],
    ),
  }),
  gemote: reply("gemote 🎁", confirm(`Giveaway emote set to 🎁! ${settingsFooter}`)),
  gembedcolor: reply("gembedcolor #ff66aa", confirm(`Giveaway embed color set! ${settingsFooter}`)),
  gwinembedcolor: reply("gwinembedcolor #ff66aa", confirm(`Giveaway win embed color set! ${settingsFooter}`)),
  gbanner: reply("gbanner https://example.com/banner.png", confirm(`Giveaway banner set! ${settingsFooter}`)),
  gdm: reply("gdm", confirm(`Giveaway DMs set to True! ${settingsFooter}`)),
  gdmmessage: reply("gdmmessage Congrats %user.mention%, you won %giveawayitem%!", confirm("Giveaway host message has been removed.")),

  birthdayannouncements: reply(
    "birthdayannouncements",
    confirm("🎉 Birthday announcements enabled! You'll receive birthday wishes when your special day arrives."),
  ),
  birthdaytimezone: reply(
    "birthdaytimezone America/New_York",
    confirm("🌍 Timezone set to America/New_York. Your birthday will be calculated using this timezone."),
  ),
  birthdaylist: reply("birthdaylist", {
    color: OK,
    title: "🎂 Upcoming Birthdays (7 days)",
    description: `\n**Today**\n✅ ${MEMBER} (turning 24)\n\n**Nov 06**\n✅ ${AUTHOR} (turning 27)\n`,
  }),
  birthdaytoday: reply("birthdaytoday", { color: OK, title: "🎉 Today's Birthdays! 🎂", description: `🎉 ${MEMBER} is turning 24!\n` }),
  birthdaychannel: reply("birthdaychannel #birthdays", confirm("🎂 Birthday announcements will now be posted in <#birthdays>!")),
  birthdayrole: reply("birthdayrole @Birthday", confirm("🎭 Users will now receive the @Birthday role on their birthday!")),
  birthdaymessage: reply(
    "birthdaymessage 🎉 Happy Birthday {user}! 🎂",
    confirm(`🎉 Birthday message updated! Preview: 🎉 Happy Birthday ${AUTHOR}! 🎂`),
  ),
  birthdaypingrole: reply("birthdaypingrole @Birthday Squad", confirm("📢 @Birthday Squad will be pinged for birthday announcements!")),
  birthdayconfig: reply("birthdayconfig", {
    color: OK,
    title: "🎂 Birthday Configuration",
    fields: fields(
      ["Channel", "<#birthdays>", true],
      ["Birthday Role", "@Birthday", true],
      ["Ping Role", "@Birthday Squad", true],
      ["Message Template", "Custom Message Set"],
      ["Default Timezone", "UTC", true],
      ["Reminder Days", "0", true],
      ["Enabled Features", "Announcements, BirthdayRole"],
    ),
  }),
  birthdayconfigreset: reply("birthdayconfigreset", confirm("🔄 Birthday configuration has been reset to defaults.")),

  join: inMusic("join", by("Joined the channel <#lounge>")),
  leave: inMusic("leave", by("Disconnected from the voice channel and cleared the queue.")),
  clearqueue: inMusic("clearqueue", by("Queue cleared and player stopped.")),
  play: chat(
    "music",
    sylveon("play rain loop"),
    bot({
      color: OK,
      title: "Search Results",
      description: [0, 2, 4].map(pickEntry).join("\n"),
      footer: "Type the numbers of the tracks you want to play, separated by spaces (for example 1 3 4).",
    }),
    say("sylveon", "1"),
    bot({
      color: OK,
      title: "Added to Queue",
      description: `**${trackLink(0)}**\n**Artist:** ${tracks[0].artist}\n**Duration:** ${tracks[0].length}\n**Position in queue:** 1`,
    }),
  ),
  pause: inMusic("pause", by("Player has been paused.")),
  nowplaying: inMusic("nowplaying", nowPlaying(0, "▶️", "01:07", progress(6), "#816de2", 1)),
  skip: inMusic("skip", nowPlaying(1, "▶️", "00:00", progress(0), "#5865f2", 2)),
  songremove: inMusic("songremove 2", by("Song removed from the queue.")),
  movesong: inMusic("movesong 3 1", by("Slow Kettle has been moved to queue position 1")),
  volume: inMusic("volume 80", by("Volume set to 80%")),
  seek: inMusic("seek 01:30", by("Seeked to position 01:30.")),
  voteskip: inMusic("voteskip", by("Skip vote: 2/3 votes needed.")),
  setdjrole: inMusic("setdjrole @DJ", by("DJ role set to DJ.")),
  saveplaylist: inMusic("saveplaylist chill", by("Playlist 'chill' saved with 5 tracks.")),
  loadplaylist: inMusic("loadplaylist chill", by(`Loaded playlist 'chill' with 5 tracks (Created by: ${AUTHOR})`)),
  playlists: inMusic("playlists", {
    color: OK,
    title: "Saved Playlists",
    description: `• chill - 5 tracks (Saved by: ${USERNAME})\n• study - 12 tracks (Saved by: Biscuit)`,
  }),
  deleteplaylist: inMusic("deleteplaylist chill", by("Playlist 'chill' has been deleted.")),
  search: inMusic("search moss lantern", {
    color: OK,
    title: "Search Results",
    description: [0, 4, 3].map(searchEntry).join("\n\n"),
    footer: "Use the play command with the number to play a track (e.g., .play 1)",
  }),
  shuffle: inMusic("shuffle", by("Queue has been shuffled!")),
  queue: inMusic("queue", {
    color: OK,
    title: "Queue - 5 tracks",
    fields: fields(
      ["Now playing", `**1. ${trackLink(0)}**\n\`${tracks[0].length} | ${USERNAME} | YouTube\``],
      ["Upcoming Tracks", [1, 2, 3, 4].map(queueEntry).join("\n\n")],
    ),
  }),
  autoplay: inMusic("autoplay 3", by("AutoPlay set to 3")),
  musicsettings: inMusic("musicsettings", {
    color: OK,
    title: "Music settings",
    fields: fields(
      ["🔄 Autoplay", "**AutoPlay**: 3 tracks."],
      ["🔊 Volume", "**Volume**: 80%"],
      ["🔁 Repeat Mode", "**Repeat**: None"],
      ["📺 Music Channel", "**Music Channel**: <#music>"],
    ),
  }),
  setmusicchannel: inMusic("setmusicchannel #music", by("Music channel set to <#music>")),
  musiclinkchannel: inMusic(
    "musiclinkchannel",
    by("Music link conversion enabled for this channel. Music links posted here will get a reply with cross-platform links."),
  ),
  musiclinkchannels: inMusic("musiclinkchannels", by("Music link conversion is enabled in:\n<#music>\n<#general>")),
  loop: inMusic("loop queue", by("Repeat type set to Queue")),

  lastfmlink: inMusic("lastfmlink", {
    color: OK,
    title: "Link Your Last.fm Account",
    description: "Open [your dashboard](https://mewdeko.tech/me) and connect your Last.fm account from the **/me** page.",
  }),
  lastfmunlink: inMusic("lastfmunlink", by("Your Last.fm account has been unlinked successfully.")),
  lastfmtoggle: inMusic("lastfmtoggle", by("Last.fm scrobbling has been **disabled**. Tracks will no longer be scrobbled.")),
  lastfmstatus: inMusic("lastfmstatus", {
    color: OK,
    title: "Last.fm Status",
    description: `**Username:** ${FM_USER}\n**Scrobbling:** Enabled`,
  }),
  fm: inMusic("fm", {
    color: OK,
    title: `🎧 Now Playing: ${USERNAME}`,
    description: `**[${tracks[0].title}](${lastFmUrl(0)})**\nby ${tracks[0].artist}\n\n**Scrobbles:** 48,213`,
  }),
  fmrecent: inMusic("fmrecent", {
    color: OK,
    title: `Recent Tracks: ${FM_USER}`,
    description: [0, 1, 2]
      .map((i) => `${i + 1}. **[${tracks[i].title}](${lastFmUrl(i)})** by ${tracks[i].artist}${i === 0 ? " `now playing`" : ""}`)
      .join("\n"),
  }),
  fmtopartists: inMusic("fmtopartists", {
    color: OK,
    title: `Top Artists: ${FM_USER} (all time)`,
    description: [
      ["Moss Lantern", "412"],
      ["Paper Satellites", "288"],
      ["Glass Orchard", "174"],
    ]
      .map(([name, plays], i) => `${i + 1}. **[${name}](${artistUrl(name)})**, ${plays} plays`)
      .join("\n"),
  }),
  fmtopalbums: inMusic("fmtopalbums 7day", {
    color: OK,
    title: `Top Albums: ${FM_USER} (7 days)`,
    description: [
      ["Window Seat", "Moss Lantern", "96"],
      ["Last Bus Home", "Paper Satellites", "71"],
      ["Tidewater", "Quiet Harbor", "44"],
    ]
      .map(([album, artist, plays], i) => `${i + 1}. **[${album}](${artistUrl(artist)})** by ${artist}, ${plays} plays`)
      .join("\n"),
  }),
  fmtoptracks: inMusic("fmtoptracks month", {
    color: OK,
    title: `Top Tracks: ${FM_USER} (1 month)`,
    description: [0, 1, 2]
      .map((i) => `${i + 1}. **[${tracks[i].title}](${lastFmUrl(i)})** by ${tracks[i].artist}, ${[58, 41, 33][i]} plays`)
      .join("\n"),
  }),
  fmartist: inMusic("fmartist Moss Lantern", {
    color: OK,
    title: "Artist: Moss Lantern",
    description: `**Global plays:** 18,402,119\n**Listeners:** 912,340\n**${FM_USER}'s plays:** 412`,
  }),
  fmalbum: inMusic("fmalbum Moss Lantern | Window Seat", {
    color: OK,
    title: "Album: Window Seat",
    description: `**Artist:** Moss Lantern\n**Global plays:** 6,120,884\n**${FM_USER}'s plays:** 96`,
  }),
  fmwhoknows: inMusic("fmwhoknows Moss Lantern", whoKnows("Who Knows: Moss Lantern")),
  fmwhoknowsalbum: inMusic("fmwhoknowsalbum Moss Lantern | Window Seat", whoKnows("Who Knows: Window Seat by Moss Lantern")),
  fmwhoknowstrack: inMusic("fmwhoknowstrack Moss Lantern | Rainy Window Loop", whoKnows("Who Knows: Rainy Window Loop by Moss Lantern")),
  fmcrowns: inMusic("fmcrowns Moss Lantern", {
    color: OK,
    title: "👑 Crown: Moss Lantern",
    description: `**${AUTHOR}** owns this artist with **412** plays\n(124 more than ${MEMBER}, in 2nd place)`,
  }),
  fmtaste: inMusic(`fmtaste ${MEMBER}`, {
    color: OK,
    title: `Taste Comparison: ${USERNAME} & Biscuit`,
    description:
      "You share **12** artists out of Biscuit's top 50 (24% overlap).\n\n**Shared artists:** Moss Lantern, Paper Satellites, Glass Orchard, Quiet Harbor",
  }),

  bass: inMusic("bass 0.5", by("Bass boost set to 0.5.")),
  nightcore: inMusic("nightcore", by("Nightcore effect enabled.")),
  vaporwave: inMusic("vaporwave", by("Vaporwave effect enabled.")),
  karaoke: inMusic("karaoke", by("Karaoke mode enabled.")),
  tremolo: inMusic("tremolo", by("Tremolo effect enabled.")),
  vibrato: inMusic("vibrato", by("Vibrato effect enabled.")),
  eightd: inMusic("eightd", by("8D audio effect enabled. Best experienced with headphones! 🎧")),
  distortion: inMusic("distortion", by("Distortion effect enabled.")),
  stereowiden: inMusic("stereowiden", by("Stereo widening effect enabled. Best experienced with headphones! 🎧")),
  lowpass: inMusic("lowpass 20", by("Low pass filter enabled with smoothing 20.")),
  echo: inMusic("echo 1 0.5", by("Echo effect enabled with delay 1s and decay 0.5.")),
  normalize: inMusic("normalize", by("Volume normalization enabled.")),
  resetfilters: inMusic("resetfilters", by("All audio filters have been reset.")),
  activefilters: inMusic("activefilters", by("Active filters: Bass Boost, Nightcore")),

  ttsenable: inMusic("ttsenable", by("TTS has been **enabled** for this voice channel.")),
  ttslink: inMusic("ttslink #music", by("TTS linked to <#music>.")),
  ttsannounce: inMusic("ttsannounce", by("Join/leave announcements **enabled** for this voice channel.")),
  ttsautojoin: inMusic(
    "ttsautojoin",
    by("Auto-join **enabled** for <#lounge>. The bot will join it when someone enters and leave once it is empty."),
  ),
  ttsjoinformat: inMusic("ttsjoinformat %user.name% hopped in", by("Join format set to: **%user.name% hopped in**")),
  ttsleaveformat: inMusic("ttsleaveformat %user.name% slipped out", by("Leave format set to: **%user.name% slipped out**")),
  ttsvolume: inMusic("ttsvolume 70", by("TTS volume set to **70%**.")),
  ttsspeed: inMusic("ttsspeed 1.2", by("TTS speed set to **1.2x**.")),
  ttsdefaultvoice: inMusic("ttsdefaultvoice Amy", by("Default TTS voice set to **Amy**.")),
  ttsvoice: inMusic("ttsvoice Brian", by("Your TTS voice set to **Brian**.")),
  ttsvoices: inMusic("ttsvoices english", {
    color: OK,
    title: 'TTS Voices matching "english" (23 total)',
    description: [
      "`1.` **Amy**, Female, English (British) (Polly)",
      "`2.` **Brian**, Male, English (British) (Polly)",
      "`3.` **Joanna**, Female, English (American) (Polly)",
    ].join("\n"),
  }),
  ttsblock: inMusic(`ttsblock ${MEMBER}`, by("**Biscuit** has been blocked from TTS.")),
  ttsblocklist: inMusic("ttsblocklist", { color: OK, title: "TTS Blocked Users (2 total)", description: `\`1.\` ${MEMBER}\n\`2.\` ${AUTHOR}` }),
  ttsrole: inMusic("ttsrole @TTS", by("TTS restricted to users with the **TTS** role.")),
  ttsreplycontext: inMusic("ttsreplycontext", by("TTS will now read reply context.")),
  ttsattachmentnarration: inMusic("ttsattachmentnarration", by("TTS will now narrate attachments.")),
  ttsconsecutivegrouping: inMusic("ttsconsecutivegrouping", by("Consecutive messages from the same user will skip the name prefix.")),
  ttsmaxqueue: inMusic("ttsmaxqueue 10", by("TTS max queue size set to **10**.")),
  ttssettings: inMusic("ttssettings", {
    color: OK,
    title: "TTS Settings",
    description:
      "**VC TTS Enabled:** Yes\n**Linked Text Channel:** <#music>\n**Join/Leave Announce:** Yes\n**Auto-Join:** No\n**Join Format:** %user.name% joined the channel\n**Leave Format:** %user.name% left the channel\n\n" +
      "**Volume:** 70%\n**Speed:** 1.2x\n**Default Voice:** Amy\n**Your Voice:** Brian\n**Required Role:** None (everyone)\n**Reply Context:** Yes\n**Attachment Narration:** No\n**Consecutive Grouping:** Yes\n**Max Queue Size:** 10",
  }),
  ttsremove: inMusic("ttsremove", by("TTS settings removed for this voice channel.")),
};
