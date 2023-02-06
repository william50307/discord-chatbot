import { SlashCommandBuilder, CommandInteraction } from 'discord.js'

export interface SlashCommand {
  //data: SlashCommandBuilder 
  data : Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  execute: (interaction: CommandInteraction) => Promise<void>
}
