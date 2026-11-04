const moduleNames: Record<string, string> = {
  Afk: "AFK",
  CoprMonitoring: "COPR Monitoring",
  LiveBoardCommands: "Live Boards",
  Nsfw: "NSFW",
  PollCommands: "Polls",
  TwitchCommands: "Twitch",
  Xp: "XP",
};

const submoduleNames: Record<string, string> = {
  AcropobiaCommands: "Acrophobia",
  AiCommands: "AI",
  AutoAssignRoleCommands: "Auto roles",
  AutoBanRole: "Auto ban role",
  BanPruneCommands: "Ban pruning",
  CmdCdsCommands: "Command cooldowns",
  CommandMapCommands: "Command aliases",
  CoprMonitoringCustomization: "Customization",
  CountingCustomization: "Customization",
  DiscordPermOverrideCommands: "Permission overrides",
  GlobalPermissionCommands: "Global permissions",
  LinkFixCommands: "Link fixing",
  LogCommands: "Logging",
  MemegenCommands: "Meme generator",
  MusicEffects: "Effects",
  MusicTts: "Text to speech",
  NetworkUtilities: "Network",
  OsuCommands: "osu!",
  PermControls: "Permission controls",
  ReputationSettings: "Settings",
  SelfAssignedRolesCommands: "Self-assigned roles",
  ServerGreetCommands: "Greets and byes",
  StreamNotificationCommands: "Stream alerts",
  SuggestionsCustomization: "Customization",
  TicTacToeCommands: "Tic-tac-toe",
  TicketConfig: "Ticket setup",
  UnitConverterCommands: "Unit converter",
  UserPunishCommands: "Warnings and punishments",
  UserPunishCommands2: "Mini warnings",
  VcRoleCommands: "Voice channel roles",
  VerboseErrorCommands: "Error messages",
};

const words = (name: string) =>
  name
    .replace(/Commands?\d*$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

/** A module's name as the commands page shows it. */
export function moduleLabel(name: string): string {
  return moduleNames[name] ?? words(name);
}

/** A submodule's name as a heading inside its module, in sentence case. */
export function submoduleLabel(name: string): string {
  if (submoduleNames[name]) return submoduleNames[name];
  const label = words(name).toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}
