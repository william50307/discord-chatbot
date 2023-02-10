import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder,EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { api_get, api_post } from '../api';

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
      option.setName('content')
        .setDescription('content')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('deadline')
        .setDescription('time format : Month/Day/Hours')
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;

    const input_users = interaction?.options.getString('users');
    const users = input_users?.split(' ').map(u => u.slice(2,-1));
    if (typeof users === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }

    const content = interaction.options.getString('content');
    const deadline = interaction.options.getString('deadline');
    if (!deadline) return;
    const [month, day, hour] = deadline.split('/');

    // send DM to all tagged users
    for(const user of users){
      interaction.client.users.send(user, 'you got a new job');
    }

    const cur_time = new Date();
    const deadline_string : string = `${cur_time.getFullYear()}-${month}-${day} ${hour}:00`; //2023-02-08 20:00
    const deadline_date :Date = new Date(deadline_string);    
    
    // create a job
    const data = {
      'deadline' : Date.parse(deadline_string),
      'content' : content,
      'hostId' : interaction.user.id,
      'clientId' : users,
    }
    const [status, res] = await api_post('/job', data);
    

    // execute on schedule 
    const cron = require("cron");
    const notify = async function(){
      for(const user_id of users){    
        const [status, res] = await api_get(`/job/${user_id}`);   
        res.data.map( (d:any) => {
          const host = interaction.client.users.cache.get(d.hostId);
          interaction.client.users.send(d.clientId, `⚠️ You still have a job to be done! ⚠️ \n Content : ${d.content} \n Status of this job : ${d.status} \n Host : ${host?.username}`)
          return;
        })
      }
    }
    //execute the job every 10 seconds
    let notification_job = new cron.CronJob('*/10 * * * * *', notify); 
    notification_job.start()

    // when the current exceed deadline, this schecdule will stop 
    setTimeout(()=> notification_job.stop(), deadline_date.getTime() - Date.now())

    //--- call api ---
    await interaction.reply({ content: 'already assign a job', ephemeral: true })

  }
}

export const SetJobStateCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('set_job_state')
    .setDescription('list all job'),

  async execute(interaction: CommandInteraction) {
    // get user input
    if (!interaction.isChatInputCommand()) return
    
    const user_id = interaction.user.id;
  
      
    // --- call api to get all job  ---
    const [status, res] = await api_get(`/job/${user_id}`);

    if (res.data.length === 0){
      await interaction.reply({ content: 'There is no job!'});
      return;
    }

    // create message 
    let msg = ''
    res.data.map( (d:any) => {
      const host = interaction.client.users.cache.get(d.hostId);
      msg += `host : ${host?.username}, job content : ${d.content} \n `
    })
    const menuoption = res.data.map((d:any) => {
      const host = interaction.client.users.cache.get(d.hostId)
      return {
      'label' : d.content,
      'description' : `host : ${host?.username} \n deadline : ${d.deadline} `,
      'value' : d.jId.toString(),
      }
    })
    
    // create a drop down list
    const row = new ActionRowBuilder<any>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('job_reply')
        .setPlaceholder('choose a job to reply')
        .addOptions(...menuoption),
    );
    
    //await interaction.reply({content : msg, ephemeral: true} )
    await interaction.reply({ content: 'change your job state here!', components: [row] });
  }
}


export const AllJobCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('all_job')
    .setDescription('see all job'),

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const user_id = interaction.user.id;
    const [status, res] = await api_get(`/job/${user_id}`);

    if (status !== 200){
      await interaction.reply({content : `something wrong when calling api `, ephemeral: true} )
    }
    
    let msg = ''
    res.data.map( (d:any) => {
      const host = interaction.client.users.cache.get(d.hostId);
      msg += `👤 Host : ${host?.username}   📝 Job content : ${d.content} \n `
    })


    if(msg === ''){
      await interaction.reply({content : 'There is no job', ephemeral: true} )
      return;
    }

    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`${interaction.user.username} \'s Job Processing States ⏭ :`)
    .setDescription(`${msg}\n`)
    .setTimestamp()


    await interaction.reply({embeds:[embed], ephemeral: true} )
  }
}