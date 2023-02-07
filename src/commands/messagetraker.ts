import { SlashCommandBuilder, CommandInteraction } from 'discord.js'
import { date } from 'io-ts-types';
import { SlashCommand } from '../types/command'
const wait = require('node:timers/promises').setTimeout;

export const MessageTrackerSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('message_trakerz')
    .setDescription('send a notification to personal message')
    .addStringOption(option =>
      option.setName('users')
        .setDescription('tag users')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('message')
        .setDescription('message')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('priority')
        .setDescription('message priority')
        .addChoices(
          { name: 'urget', value: '5' },
          { name: 'fast', value: '15' },
          { name: 'normal', value: '30' },
        )
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;

    //這裡input tag人要空一個空白鍵，有空的話可以改成正規表達式
    const input_users = interaction?.options.getString('users');
    const users = input_users?.split(' ')
    if (typeof users === 'undefined'){
      await interaction.reply('there are no user in input string');
      return;
    }
    const message = interaction.options.getString('message');
    const priority = interaction.options.getString('priority');
    if (!message || !priority) return; 

    // send DM to all tagged users
    for(const user of users){
      interaction.client.users.send(user.slice(2,-1), 'you got a new meesage, please reply ASAP');
    }

    // use listner to send notification


    //--- call api ---
    await interaction.reply({ content: input_users + ' ' + message, ephemeral: true })

  }
}

export const MessageTrackerReplySlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('message_traker_reply')
    .setDescription('list all messgae to be reply')
    .addStringOption(option =>
      option.setName('reply_message')
        .setDescription('reply message')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('msg_id')
        .setDescription('msg_id')
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;

    const message = interaction?.options.getString('reply_message');
    const msg_code = interaction.options.getString('msg_code');

    // call api, user has reply

    // send DM to tracker

    await interaction.reply({ content: 'success', ephemeral: true })

  }
}