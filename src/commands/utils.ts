import { SlashCommandBuilder, CommandInteraction, Collection, Message, InteractionType } from 'discord.js'
import { date } from 'io-ts-types';
import { SlashCommand } from '../types/command'
import { apiFetch } from '../api';

const wait = require('node:timers/promises').setTimeout;

export const AllUserIdSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('alluser_id')
    .setDescription('get all user state'),

  async execute(interaction: CommandInteraction) {

    const guild = interaction.client.guilds.cache.get('1071008703815356416');
    
    //channel.members
    let msg = '';
    guild?.members.cache.map(m => msg += `useranme : ${m.user.username} userid : ${m.user.id} \n`)
    
    // --- call api to store in database ---

    await interaction.reply({content : msg, ephemeral: true} )
  }
}
