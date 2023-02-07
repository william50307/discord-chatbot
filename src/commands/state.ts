import { SlashCommandBuilder, CommandInteraction, Collection, Message, InteractionType } from 'discord.js'
import { date } from 'io-ts-types';
import { SlashCommand } from '../types/command'
import { api_get, api_put } from '../api';

const wait = require('node:timers/promises').setTimeout;

export const AllUserStateSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('alluser_state')
    .setDescription('get all user state'),

  async execute(interaction: CommandInteraction) {
    // get user input
    const [status, data] = await api_get('user_list');
    let msg = '';
    data['data'].map( (d:any) => {
      const user = interaction.client.users.cache.get(d.uId);
      console.log(user);
      
      msg += `user : ${user?.username} status : ${d.status} \n`
    })

    // --- call api to store in database ---

    await interaction.reply({content : msg, ephemeral: true} )
  }
}


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
    const data = {'uId' : interaction.user.id, 'status' : state}
    
    
    // --- call api to store in database ---
    const [status, res] = await api_put('user', data);

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

    await interaction.reply({content : `user : ${user?.username}'s  last messsage was at : ${dateObj.toString()}`, ephemeral: true} )
  }
}
