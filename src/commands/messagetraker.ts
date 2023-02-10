import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'
import { api_post, api_get } from '../api'

const wait = require('node:timers/promises').setTimeout;

export const MessageTrackerSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('emergency_message')
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
    const users = input_users?.split(' ').map(u => u.slice(2,-1))
    if (users?.length === 0 || typeof users === 'undefined'){
      await interaction.reply({content : 'there are no user in input string', ephemeral: true});
      return;
    }

    const message = interaction.options.getString('message');
    if (!message) return; 

    // send DM to all tagged users
    for(const user of users){
      interaction.client.users.send(user, '‼️ You got a new emergency meesage, please reply ASAP ‼️');
    }
    const user_id = interaction.user.id;
    // call api to store a emergency tag
    const data = {
      'hostId' : user_id,
      'clientId' : users,
      'content' : message
    }
    const [status, res] = await api_post('/tag', data)
    // use listner to send notification

    //execute the job every 10 seconds
    // const notify = function(){

    // }
    // let notification_job = new cron.CronJob(`*/${priority} * * * * *`, notify); 
    // notification_job.start()

    // setTimeout(()=> notification_job.stop(), deadline_date.getTime() - Date.now())
    

    //--- call api ---
    await interaction.reply({ content: 'The emergency message has been created ✅', ephemeral: true })

  }
}

export const MessageTrackerReplySlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('emergency_message_reply')
    .setDescription('list all messgae to be reply'),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;
    const user_id = interaction.user.id;

    // --- call api to get all job  ---
    const [status, res] = await api_get(`/tag/${user_id}`);

    if (res.data.length === 0){
      await interaction.reply({ content: 'There is no emergency message to reply!', ephemeral: true});
      return;
    }

    const menuoption = res.data.map((d:any) => {
      const host = interaction.client.users.cache.get(d.hostId)
      return {
      'label' : `host : ${host?.username}`,
      'description' : `message : ${d.content} `,
      'value' : d.msgId.toString(),
      }
    })
    
    // create a drop down list
    const row = new ActionRowBuilder<any>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('emergency_message_reply')
        .setPlaceholder('choose a message to reply')
        .addOptions(...menuoption),
    );
    
    //await interaction.reply({content : msg, ephemeral: true} )
    await interaction.reply({ content: 'reply the emergency message', components: [row], ephemeral: true });

  }
}

export const AllEmergencyMessageCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('all_emergency_message')
    .setDescription('see all emergemcy message'),

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const user_id = interaction.user.id;

    // --- call api to get all job  ---
    const [status, res] = await api_get(`/tag/${user_id}`);

    if (res.data.length === 0){
      await interaction.reply({ content: 'There is no emergency message to reply!', ephemeral: true});
      return;
    }

    if (status !== 200){
      await interaction.reply({content : `something wrong when calling api `, ephemeral: true} )
    }
    
    let msg = ''
    res.data.map( (d:any) => {
      const host = interaction.client.users.cache.get(d.hostId);
      msg += `👤 Host : ${host?.username},\n\n ⚠️ Urgent message content : ${d.content} \n `
    })

    const embed = new EmbedBuilder()
    .setColor(0xF5492E)
    .setTitle('Unreplied Urgent Messages 💬')
    .setDescription(`${msg}`)
    .setTimestamp()



    if(msg === ''){
      await interaction.reply({content : 'There is no emergency message', ephemeral: true} )
      return;
    }
    await interaction.reply({embeds:[embed], ephemeral: true} )
  }
}