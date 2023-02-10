import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'

const wait = require('node:timers/promises').setTimeout;

export const SetStateSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('set_state')
    .setDescription('change current state')
    .addStringOption(option =>
      option.setName('state')
        .setDescription('The gif category')
        .setRequired(true)
        .addChoices(
          { name: 'idle', value: 'idle' },
          { name: 'meeting', value: 'meeting' },
          { name: 'busy', value: 'busy' },
        )
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    // get user input
    if (!interaction.isChatInputCommand()) return
    const state = interaction.options.getString('state');
    
    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('State Changed!✅')
    .setDescription(`Dear ${interaction.user.username} 😃, \n\n You've changed your state to ${state}\n`)
    .setTimestamp()
   
    console.log('here???')
    

    // --- call api to store in database ---

    await interaction.reply({embeds:[embed]})
  }
}
