import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,ModalBuilder,TextInputBuilder, TextInputStyle,StringSelectMenuBuilder } from 'discord.js'
import { boolean } from 'io-ts';
import { SlashCommand } from '../types/command'
//const cron = require('node-cron');


const wait = require('node:timers/promises').setTimeout;

export const MeetSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('meets')
    .setDescription('set up a meeting!')
    .addStringOption(option =>
      option.setName('attendees')
        .setDescription('users to enter the meeting')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('types')
        .setDescription('three types to choose')
        .setRequired(true)
        .addChoices(
          { name: 'Normal🌼 (reply in a day)', value: '1day' },
          { name: 'Medium⭐️ (reply in 1 hours)', value: '1hr' },
          { name: 'Emergemcy🔥 (reply in 5 mins)', value: '5mins' },
        )
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return ;
    const level = interaction.options.getString('types');
    const cha = interaction.channel
    //var t = 0
      // if(level === '1day'){
      //   t = 24*60*60
       
      // }
      // else if(level === '1hr'){
      //   t = 60*60
      // }
      // else{
      //   t = 5*60
      // }
      const input_users = interaction?.options.getString('attendees');
      const users = input_users?.split(' ')
      if (typeof users === 'undefined'){
        await interaction.reply('there are users in input string');
        return;
      }
      //let msg:string = 'The Attendees😀:  ';

      let msg:string = '‼️ Meeting Invitation from user ‼️ : \n' + interaction.user.username
      msg = msg + `\n ⚠️ Please confirm in ${level} at ${cha} `
      

      for (const sel of users){
        interaction.client.users.send(sel.slice(2,-1), msg);
      } 


    

    //meeting sheets
    const modal = new ModalBuilder()
			.setCustomId(`${level}`) //id fluctuates with the time!
			.setTitle(`${level} Meeting INFO 📝`);

    const meet = new TextInputBuilder()
			.setCustomId('meetname')
		    // The label is the prompt the user sees for this input
			.setLabel("Topic:")
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const loc = new TextInputBuilder()
			.setCustomId('loc')
			.setLabel("Location:")
			.setStyle(TextInputStyle.Short);
    
    const time = new TextInputBuilder()
			.setCustomId('time')
			.setLabel("Time:")
      .setValue('2023-02-08 18:00:00')
			.setStyle(TextInputStyle.Short);
    
    const member = new TextInputBuilder()
			.setCustomId('attend')
			.setLabel("This invitation Should be replied in:")
      .setValue(`${users}`)
			.setStyle(TextInputStyle.Short);

    const content = new TextInputBuilder()
			.setCustomId('content')
			.setLabel("Content:")
      .setValue('ex. A project discussion for brand promotion...')
			.setStyle(TextInputStyle.Paragraph);
    


		  const one = new ActionRowBuilder<any>().addComponents(meet);
		  const two = new ActionRowBuilder<any>().addComponents(loc);
      const three = new ActionRowBuilder<any>().addComponents(time);
      const four = new ActionRowBuilder<any>().addComponents(member);
      const five = new ActionRowBuilder<any>().addComponents(content);
      modal.addComponents(one,two,three,four,five);
      await interaction.showModal(modal)
      //call api to store the whole meeting info!
      //...

      //signal the employee to join the meeting (for demo: 2mins)

    //   const dateToCron = (date) => {
    //     const minutes = date.getMinutes();
    //     const hours = date.getHours();
    //     const days = date.getDate();
    //     const months = date.getMonth() + 1;
    //     const dayOfWeek = date.getDay();
    
    //     return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
    // };
      //   //reminders before meeting!  
      // let reminder:string = '‼️ Warning ⚠️  ‼️ : \n\n Meeting will start in 10 mins!!!'
      //   //reminder = reminder + `\n ⚠️ Please confirm in ${level} at ${cha} `
        
        
      // const cron = require("cron");
      // const test = function(t :any){
      //     for(const user of users){
      //        interaction.client.users.send(user.slice(2,-1), reminder);
      //      }
      //     console.log('meeting msg sent');
      //     //return;
      //   }
      //   //execute the job (meeting date -  due date)
      // var today = new Date();

      // var yr = today.getFullYear()
      // var mon = today.getMonth()+1
      // var dt = today.getDate();
      // var hr = today.getHours() 
      // var min = today.getMinutes(); //+ ":" + today.getSeconds();
      
        
      // let job1 = new cron.CronJob('10  * * * *', test); 
      // job1.start()
   

      
      



      
  }
}
