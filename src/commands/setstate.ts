import { SlashCommandBuilder, CommandInteraction, Collection, Message, InteractionType } from 'discord.js'
import { date } from 'io-ts-types';
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

    // --- call api to store in database ---

    await interaction.reply({content : `change your state to ${state}`, ephemeral: true} )
  }
}

export const LastMessageCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('last_message')
    .setDescription(`check a user's last meesage`)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('get user')
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    // get user input
    const user = interaction.options.getUser('user');

    let lastest:number = 0;
    if (!interaction.guild) return;
    for (const channel of interaction.guild.channels.cache.values()){
      if (channel.isTextBased()){
        let messages = await channel.messages.fetch().catch(e => console.log(e));
        if (!messages) return;     
        for(const msg of messages){         
          if (msg[1].author.id === user?.id && msg[1].createdTimestamp > lastest){
            lastest = msg[1].createdTimestamp
          }
        }
      }
    }

    // latest timestamp
    const dateObj = new Date(lastest)
    
    // --- call api to store in database ---
    //const { username, lastMessage } = await interaction.client.fetchUser(user.id);
    //console.log(`${username} last message was at ${lastMessage}`);
    await interaction.reply({content : `user : ${user?.username}'s  last messsage was at : ${dateObj.toString()}`, ephemeral: true} )
  }
}
