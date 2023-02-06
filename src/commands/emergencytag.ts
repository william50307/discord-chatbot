import { SlashCommandBuilder, CommandInteraction } from 'discord.js'
import { SlashCommand } from '../types/command'
const wait = require('node:timers/promises').setTimeout;

export const EmergencyTagSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('emergency_tag')
    .setDescription('send a notification to personal message')
    .addStringOption(option =>
      option.setName('users')
        .setDescription('tag users')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('message')
        .setRequired(true)),
  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;
    
    //這裡input tag人要空一個空白鍵，有空的話可以改成正規表達式
    const input_users = interaction?.options.getString('users');
    const users = input_users?.split(' ')
    if (typeof users === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }
    let msg:string = 'message from user : ' + interaction.user.username
    msg = msg + '\ncontent:\n' + interaction.options.getString('message');

    // send DM to all tagged users
    for(const user of users){
      interaction.client.users.send(user.slice(2,-1), msg);
    }
    
    //--- colck logic ---
    // const cron = require("cron");
    // const test = function(t :any){
    //   // for(const user of users){
    //   //   interaction.client.users.send(user.slice(2,-1), msg);
    //   // }
    //   console.log('123');
    //   //return;
    // }
    // //execute the job every second
    // let job1 = new cron.CronJob('* * * * * *', test); 
    // job1.start()


    //--- call api ---

    await interaction.reply({ content: 'success', ephemeral: true })

  }
}