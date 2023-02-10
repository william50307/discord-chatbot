import { SlashCommandBuilder, CommandInteraction, Collection, Message, InteractionType,EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { api_get, api_put } from '../api';

const wait = require('node:timers/promises').setTimeout;

export const AllUserStateSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('all_user_state')
    .setDescription('get all user state'),

  async execute(interaction: CommandInteraction) {
    // get user input
    const [status, res] = await api_get('/user_list');
    let msg = '';
    res['data'].map( (d:any) => {
      const user = interaction.client.users.cache.get(d.uId);
      if (user !== undefined){
        msg += `👤 User: ${user?.username}  🔘 Status : ${d.status} \n\n`
      }
    })

    // --- call api to store in database ---
    const embed = new EmbedBuilder()
    .setColor(0xF4E033)
    .setTitle('All Users\' States:')
    .setDescription(`${msg}`)
    .setTimestamp()


    await interaction.reply({embeds:[embed], ephemeral: true} )
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
    const [status, res] = await api_put('/user', data);
    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('State Changed!✅')
    .setDescription(`Dear ${interaction.user.username} 😃, \n\n You've changed your state to " ${state} "\n`)
    .setTimestamp()

    await interaction.reply({embeds : [embed] , ephemeral: true} )
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

    const embed = new EmbedBuilder()
    .setColor(0x802EF5)
    .setTitle('Last Message Sent 💬')
    .setDescription(`${user?.username}\'s last messsage was sent at :\n\n 🕐 ${dateObj.toString()}\n\n`)
    .setTimestamp()

    await interaction.reply({embeds:[embed], ephemeral: true} )
  }
}
