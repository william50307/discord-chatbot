import { time } from 'console';
import { SlashCommandBuilder, CommandInteraction } from 'discord.js'
import { SlashCommand } from '../types/command'
const wait = require('node:timers/promises').setTimeout;

export const AssignJobSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('assign_job')
    .setDescription('send a notification to personal message')
    .addStringOption(option =>
      option.setName('users')
        .setDescription('tag users')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('job_message')
        .setDescription('job_message')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('deadline')
        .setDescription('time format : Month/Day/Hours')
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;

    const input_users = interaction?.options.getString('users');
    const users = input_users?.split(' ')
    if (typeof users === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }

    const job_description = interaction.options.getString('job_description');

    const deadline = interaction.options.getString('deadline');
    if (!deadline) return;
    const [month, day, hour] = deadline.split('/');

    // send DM to all tagged users
    for(const user of users){
      interaction.client.users.send(user.slice(2,-1), 'you got a new job');
    }

    const cur_time = new Date();
    const deadline_string : string = `${cur_time.getFullYear()}-${month}-${day} ${hour}:00`;
    const deadline_date :Date = new Date(deadline_string);    
    
    //--- execute on schedule ---
    const cron = require("cron");
    const notify = function(){
      // for(const user of users){
      //   interaction.client.users.send(user.slice(2,-1), msg);
      // }
      console.log('send a notifitcation');
      //return;
    }
    //execute the job every 10 seconds
    let notification_job = new cron.CronJob('*/10 * * * * *', notify); 
    notification_job.start()

    setTimeout(()=> notification_job.stop(), deadline_date.getTime() - Date.now())

    //--- call api ---
    await interaction.reply({ content: 'already assign a job', ephemeral: true })

  }
}