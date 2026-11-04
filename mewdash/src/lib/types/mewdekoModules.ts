// lib/types/mewdekoModules.ts
export type Module = {
  Name: string;
  Commands: Command[];
};

export type Command = {
  ChannelBotPermissions: string;
  ChannelUserPermissions: string;
  CommandName: string;
  Description: string;
  HtmlDescription?: string;
  Example: string[];
  GuildBotPermissions: string;
  GuildUserPermissions: string;
  IsDragon: boolean;
  ListOptions: string[];
  BotVersion: string;
  /** The bot submodule the command sits in, absent when it belongs to the module directly. */
  Submodule?: string;
};
