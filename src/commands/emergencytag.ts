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
        .setRequired(true))
    .addStringOption(option =>
          option.setName('delay_days')
            .setDescription('How long do you want to remind others?')
            .setRequired(true)
            .addChoices(
              { name: 'A Day', value: 'aday' },
              { name: '12 hours', value: '12hour' },
              { name: '1 hours', value: '1hour' },
            )),
  async execute(interaction: CommandInteraction) {

    //這裡input tag人要空一個空白鍵，抓有空的話可以改成正規表達式寫打

    if (!interaction.isChatInputCommand()) return;
    const input_users = interaction?.options.getString('users');
    const delay = interaction?.options.getString('delay_days');
    const users = input_users?.split(' ')
    if (typeof users === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }
    let msg:string = 'message from user : ' + interaction.user.username
    msg = msg + '\ncontent:\n' + interaction.options.getString('message')

    // send DM to all tagged users
    // for(const user of users){
    //   interaction.client.users.send(user.slice(2,-1), msg);
    // }

    const time: number = Date.now() / 1000;
    console.log(time);

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
    const cron = require('cron').CronJob;
    console.log('Before job instantiation');
    var today = new Date();
    var next_time ;
    if (delay === 'aday'){
      next_time = new Date( today.getTime() + (24 * 60 * 60 * 1000))
    }else if (delay === '12hour'){
      next_time = new Date( today.getTime() + (12 * 60 * 60 * 1000))
    }else{
      next_time = new Date( today.getTime() + (10 * 1000))
    }
    var year = next_time.getFullYear()
    var mon = next_time.getMonth()
    var date = next_time.getDate()
    var _hour = next_time.getHours()
    var min = next_time.getMinutes()
    var sec = next_time.getSeconds()

    const ss = sec+' '+min+' '+_hour+' '+date+ ' ' + mon + ' *'
    console.log(ss)
    const job = new cron(ss,function() {
      for(const user of users){
        interaction.client.users.send(user.slice(2,-1), msg);
      }
      console.log('Start!')
    })
    console.log('After job instantiation')
    job.start();
    await interaction.reply({ content: 'Successfully!', ephemeral: true })

  }
}