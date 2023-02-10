import { Client, Collection, Events,ActionRowBuilder} from 'discord.js'
import { AppConfig } from './config'
import { AppError, botLoginErrorOf } from './errors'
import { SlashCommand } from './types/command'
import { DiscordjsClientLoginError } from './types/response'
import * as TE from 'fp-ts/TaskEither'
import { ButtonBuilder, ButtonStyle, EmbedBuilder,ModalBuilder,TextInputBuilder, TextInputStyle,StringSelectMenuBuilder } from 'discord.js'
import { api_put, api_post, api_get } from './api';

export const loginBot: (appConfig: AppConfig) => (client: Client) => TE.TaskEither<AppError, string> =
  (appConfig) => (client) =>
    TE.tryCatch(
      () => client.login(appConfig.token),
      (e) => botLoginErrorOf(`Bot Login Fail: ${(e as DiscordjsClientLoginError).code}`)
    )

const  voteMembers = new Set();

export const setBotListener: (client: Client) => (commandList: Array<SlashCommand>) => void =
  (client) => (commandList) => {
    const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

    client.once(Events.ClientReady, () => {
      console.log('Bot Ready!');
      // message tracker
      const cron = require("cron");
      const notify = async function(){
        const [status, res] = await api_get(`/tag`); 
        for(const d of res.data){
            const host = client.users.cache.get(d.hostId);
            client.users.send(d.clientId, `your emergency message hasn't been replyed! \n host : ${host?.username} \n content : ${d.content} `)
        }
        return;
      }
      //execute the job every 10 seconds
      let notification_job = new cron.CronJob('*/10 * * * * *', notify); 
      notification_job.start()
    })

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      const command = commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      }
    })


    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isButton()) return;
      console.log(interaction);
      if(!interaction.channel) return;
     const collector = interaction.channel.createMessageComponentCollector({time: 15000 });

      collector.on('collect', async buttonInteraction => {
        if (buttonInteraction.customId === 'yes'){
          await buttonInteraction.update({ content: 'Yes button was clicked!', components: [] });
          // send DM to who react
          await buttonInteraction.user.send({content : 'Yes butoon was clicked!'})
        }
        else if(buttonInteraction.customId === 'no'){
          await buttonInteraction.update({ 'content': 'No button was clicked!', components: [] });
          // send DM to who react        
          await buttonInteraction.user.send({'content' : 'No butoon was clicked!'})
        }
        
      });

      collector.on('end', collected => console.log(`Collected ${collected.size} items`));

      if(interaction.customId == 'foodjoin'){
        
        //for user order if  they select "join!"
      const modal = new ModalBuilder()
      .setCustomId('orders')
      .setTitle('Your Food Order🍖');

      const food = new TextInputBuilder()
      .setCustomId('userfood')
        // The label is the prompt the user sees for this input
      .setLabel("enter your choice")
      .setValue('a,b,c...')
        // Short means only a single line of text
      .setStyle(TextInputStyle.Short);

      const num = new TextInputBuilder()
      .setCustomId('ordernum')
      .setLabel("number")
      .setStyle(TextInputStyle.Short);
    
      const price = new TextInputBuilder()
      .setCustomId('price')
      .setLabel("total cost:")
      .setStyle(TextInputStyle.Short);

      const others = new TextInputBuilder()
      .setCustomId('other')
      .setLabel("Others")
      .setStyle(TextInputStyle.Paragraph);

      // const id = new TextInputBuilder()
      // .setCustomId('id')
      // .setLabel("Defult ID")
      // .setValue('1')
      // .setStyle(TextInputStyle.Paragraph);

      const one= new ActionRowBuilder<any>().addComponents(food);
      const two = new ActionRowBuilder<any>().addComponents(num);
      const three = new ActionRowBuilder<any>().addComponents(price);
      const four = new ActionRowBuilder<any>().addComponents(others);

      modal.addComponents(one,two,three,four);
      await interaction.showModal(modal)



      }
      else if(interaction.customId == 'foodpass'){


      const embed3 = new EmbedBuilder()
      .setTitle(`See You!`)
      .setColor(0xFF0000)
      .setDescription(`Join us next time🥳`)
      .setTimestamp()

      await interaction.reply({embeds:[embed3],ephemeral:true});

  
      }
      else if(interaction.customId == 'attend'){
        const ppl = interaction.client.user
        const joint = interaction.client.user.username //this is chatbot
        console.log('user who clicked')
        console.log(ppl)

        const embed3 = new EmbedBuilder()
        .setTitle(`Great! ${interaction.user.username} will join this meeting`)
        .setColor(0xFFD733)
        .setDescription(`The bot will remind you 10 mins before the meeting starts!🥳`)
        .setTimestamp()
        //call api to store the user who confirmed to attend the meeting
        //...
        const data = {'uId' : interaction.user.id,'choose':"accept",'reason':' '}
        const [status, res] = await api_put('/choose',data);

        await interaction.reply({embeds:[embed3],ephemeral:true});
  
    
        }
        else if(interaction.customId == 'reject'){
          const ppl = interaction.client.user
          const joint = interaction.client.user.username

          const embed3 = new EmbedBuilder()
          .setTitle(`Opps! You won't join this meeting 😰`)
          .setColor(0xF31332)
          .setDescription(`Wait to choose why not available...`)
          .setTimestamp()

          //for reject reason
          const row = new ActionRowBuilder<any>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('rejects')
              .setPlaceholder('Meeting Rejected')
              .addOptions(
                {
                  label: 'Time Conflict ⏱',
                  description: 'I\'m not available...', 
                  value: 'Time Conflict',
                },
                {
                  label: 'On Business Trip ✈️',
                  description: 'I\'m on a business trip and won\'t be available for a while...',
                  value: 'On Business Trip',
                },
                {
                  label: 'Location Issues',
                  description: 'I can\'t make it to the place where meeting holds...',
                  value: 'Location Issues',
                },
                {
                  label: 'Others',
                  description: 'Input custom reasons',
                  value: 'Others',
                },

              ),
          )

          
  
          await interaction.reply({embeds:[embed3],ephemeral:true});
          const wait = require('node:timers/promises').setTimeout
          //await wait(1000)//wait for 10 secs
          await interaction.editReply({components:[row]});


    
      
          }

          if (interaction.customId === 'onoffboard'){
            const row = new ActionRowBuilder<any>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('select_onoffboard')
                .setPlaceholder('Choose one question of On/off boarding')
                .addOptions(
                  {
                    label: 'Create_account 🏦',
                    //description: '',
                    value: 'first_option',
                  },
                  {
                    label: 'All website and their usage 🗂',
                    //description: '',
                    value: 'second_option',
                  },
                  {
                    label: 'Common problem ⁇',
                    //description: '',
                    value: 'third_option',
                  },
    
                ),
            )
    
            await interaction.reply({ content: 'Testing!', components: [row]  })
          }
          else if(interaction.customId === 'administrative'){
            const row = new ActionRowBuilder<any>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('select_adm')
                .setPlaceholder('Choose one question')
                .addOptions(
                  {
                    label: 'Overtime hours 🕖',
                    value: 'first_option',
                  },
                  {
                    label: 'Application for reimbursement 😆',
                    value: 'second_option',
                  },{
                    label: 'Download Documents 📃',
                    value: 'third_option',
                  },
                ),
            )
    
            await interaction.reply({ content: 'Testing!', components: [row]  })
    //        await interaction.update({ content: 'Yes button was clicked!', components: [] });
          }else if(interaction.customId === 'staff'){
            const row = new ActionRowBuilder<any>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('select_staff')
                .setPlaceholder('Choose one question')
                .addOptions(
                  {
                    label: 'Gym 🏃🏻‍♂️',
                    //description: 'Gym',
                    value: 'first_option',
                  },
                  {
                    label: 'Employee Benefits 🔆',
                    //description: 'Employee Benefits',
                    value: 'second_option',
                  },
                ),
            )
            await interaction.reply({ content: 'Testing!', components: [row] })
          }else if(interaction.customId === 'recommend'){
            const row = new ActionRowBuilder<any>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('select_rec')
                .setPlaceholder('Choose one question')
                .addOptions(
                  {
                    label: 'Learning 📒',
                    value: 'first_option',
                  },
                  {
                    label: 'Languages 🔤',
                    value: 'second_option',
                  },
                ),
            )
    
            await interaction.reply({ content: 'Testing!', components: [row]  })
          }else if(interaction.customId === 'first_option'){
            if (voteMembers.has(`${interaction.user.id} - ${interaction.message.id}`)){
              await interaction.reply({content: "You've already voted."})
            }
            console.log('Yes')
    
            voteMembers.add(`${interaction.user.id}`)
            const pollEmbed = interaction.message.embeds[0];
            if(!pollEmbed) {
              await interaction.reply({content: "You've already voted."})
            }
            
    
            const yesField = pollEmbed.fields[0];
            //const noField = pollEmbed.fields[1];
            const VoteCountReply = "Your vote has been counted.";
            const newNoCount = parseInt(yesField.value) +1
            yesField.value = ''+newNoCount
            await interaction.reply({content: VoteCountReply,ephemeral:true})
            await interaction.message.edit({embeds:[pollEmbed]})
    
    
          }else if(interaction.customId === 'second_option'){
            if (voteMembers.has(`${interaction.user.id}`)){
              await interaction.reply({content: "You've already voted."})
            }
    
            voteMembers.add(`${interaction.user.id}`)
            const pollEmbed = interaction.message.embeds[0];
            if(!pollEmbed) {
              await interaction.reply({content: "You've already voted."})
            }
    
            //const yesField = pollEmbed.fields[0];
            const noField = pollEmbed.fields[1];
            const VoteCountReply = "Your vote has been counted.";
            const newNoCount = parseInt(noField.value) +1
            noField.value = ''+newNoCount
            await interaction.reply({content: VoteCountReply,ephemeral: true})
            await interaction.message.edit({embeds:[pollEmbed]})
          }
          else if(interaction.customId === 'engineer'){
            //randomly select a meme to post
            //const fs = require('fs');
            const num = (Math.floor(Math.random()* 7)+1).toString();
            //var files = fs.readdirSync(`./src/memes`).filter(endsWith('.png'))
            
            await interaction.reply({ files:[`./src/memes/meme${num}.jpeg`]});
          }
          else if(interaction.customId === 'cured'){
            //randomly select a meme to post
            //const fs = require('fs');
            const num = (Math.floor(Math.random()* 5)+1).toString();
            //var files = fs.readdirSync(`./src/memes`).filter(endsWith('.png'))
            await interaction.reply({ files:[`./src/meme2/meme${num}.jpeg`]});
          }
          else if(interaction.customId === 'lol'){
            //randomly select a meme to post
            //const fs = require('fs');
            const num = (Math.floor(Math.random()* 5)+1).toString();
            //var files = fs.readdirSync(`./src/memes`).filter(endsWith('.png'))
            await interaction.reply({ files:[`./src/meme3/meme${num}.jpeg`]});
          }

    });

    const wait = require('node:timers/promises').setTimeout;

    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isStringSelectMenu()) return;

      
      if (interaction.customId === 'emergency_message_reply'){
   
        const msg_id = interaction.values[0];     
        const modal = new ModalBuilder()
          .setCustomId('emergency_message_modal')
          .setTitle('reply emergency message');

        const favoriteColorInput = new TextInputBuilder()
          .setCustomId('emergency_reply')
          .setLabel("reply message")
          .setStyle(TextInputStyle.Short);

        const hobbiesInput = new TextInputBuilder()
          .setCustomId('emergency_message_key')
          .setLabel("don't change")
          .setValue(msg_id)
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder<any>().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder<any>().addComponents(hobbiesInput);

        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
      } 

      else if (interaction.customId === 'change_job_state'){
        const [job_id, state] = interaction.values[0].split(' ');
        // signal 
        const [status, res] = await api_put('/job', {'jId' : job_id, 'status' : state})
        
        if (status === 200){      
          const host = interaction.client.users.cache.get(res.hostId);
          const client = interaction.client.users.cache.get(res.clientId);
          if (host === undefined) return;
          // notify host 
          interaction.client.users.send(host?.id, `user : ${client?.username} changed the status to ${state} \n job content: ${res.content}`);
          await interaction.reply({content : `your job status has been changed to '${state}'`, ephemeral: true} );
        }
        else{
          await interaction.reply({content : 'something wrong when calling the api', ephemeral: true} )
        }
        //
      }

      else if (interaction.customId === 'job_reply'){
        const job_id = interaction.values[0];

        const row = new ActionRowBuilder<any>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('change_job_state')
            .setPlaceholder('change your job state here')
            .addOptions({
							label: 'Processing',
							description: 'change job state to Processing',
							value: `${job_id} processing`,
						},
						{
							label: 'Done',
							description: 'change job state to Done',
							value: `${job_id} Done`,
						}),
        );

        await interaction.reply({ content: 'please change your job state!', components: [row] })
      }
      else if (interaction.customId === 'select_onoffboard') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'You should visit this website:....\nIf you have other problems, please contact Mr.Liu.'});
        }else if(selected === 'second_option'){
          await interaction.reply({ content: 'There are all websites you may need, and we also tell you when you will need them.'});
        }else if(selected === 'third_option'){
          await interaction.reply({ content: '📍 Where is HR\'s office?\n📍 Where can I buy dinner?\n📍 How can I apply for a bonus?'});
        }
        else await interaction.reply({ content: `${selected} was selected!`});
      }else if (interaction.customId === 'select_adm') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'You need to follow these steps:\n First,.....'});
        }else if(selected === 'second_option'){
            await interaction.reply({ content: 'You need to follow these steps:\n First,.....'});
        }else if(selected === 'third_option'){
          await interaction.reply({ content: '📍 Resignation form\n📍Reimbursement Form\n'});
      }
        else await interaction.reply({ content: `${selected} was selected!`});
      }else if (interaction.customId === 'select_staff') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'Click me to Apply for Gym!'});
        }else if(selected === 'second_option'){
            await interaction.reply({ content: '📍 Vacations\n📍Bonus\n'});
        }
        else await interaction.reply({ content: `${selected} was selected!`});
      }else if (interaction.customId === 'select_rec') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'We can recommend you some courses:\n'});
        }else if(selected === 'second_option'){
            await interaction.reply({ content: 'We can recommend you some courses:\n'});
        }
        else await interaction.reply({ content: `${selected} was selected!`});
      }
      else if(interaction.customId === 'rejects'){
        const reason = interaction.values[0];
        //for entering reasons:
        const modal = new ModalBuilder()
              .setCustomId(`reasons`) //id fluctuates with the time!
              .setTitle(`${reason} 📝`);
                if(reason == 'Time Conflict'){ //time conflict

                  const quest = new TextInputBuilder()
                  .setCustomId('newtime')
                  .setLabel("When are you available?:")
                  .setValue('format: 2023/02/10, 16:00')
                  .setStyle(TextInputStyle.Short);
                  const row = new ActionRowBuilder<any>().addComponents(quest);
                  modal.addComponents(row);
                  await interaction.showModal(modal)

                }
                else if(reason == 'Location Issues'){ //location conflict

                  const quest = new TextInputBuilder()
                  .setCustomId('newplace')
                  .setLabel("Where are you available?:")
                  .setValue('format: Taipei, TSMC HQ, etc.')
                  .setStyle(TextInputStyle.Short);
                  const row = new ActionRowBuilder<any>().addComponents(quest);
                  modal.addComponents(row);
                  await interaction.showModal(modal)


                }
                else if(reason == 'Others'){ //other reason

                  const quest = new TextInputBuilder()
                  .setCustomId('others')
                  .setLabel("Personal reasons")
                  .setStyle(TextInputStyle.Paragraph);
                  const row = new ActionRowBuilder<any>().addComponents(quest);
                  modal.addComponents(row);
                  await interaction.showModal(modal)

                }
                else{

                  const embed2 = new EmbedBuilder()
                  .setTitle(`Sent Successfully!🥳`)
                  .setColor(0xFF0000)
                  .setTimestamp()
                  
                  await interaction.reply({embeds:[embed2]})

                }
                
      }
      
        
      
    })
    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isModalSubmit()) return ;

      if (interaction.customId === 'emergency_message_modal'){
        const reply = interaction.fields.getTextInputValue('emergency_reply')
        const key = interaction.fields.getTextInputValue('emergency_message_key')


        const [status, res] = await api_put('/tag', {'msgId' : key})

        const user = interaction.client.user;
        const host = interaction.client.users.cache.get(res.data[0].hostId)
        //if (typeof host === 'undefined') await interaction.reply({content:'can not get the host id'});
        interaction.client.users.send(res.data[0].hostId, `user : ${host?.username} has been reply the message : ${res.data[0].content} \n reply content:\n ${reply}`)
        await interaction.reply({content:'success'})
      }
      
      //modal for food
      else if (interaction.customId === 'foodies') {
        //get link and name given by the people who triggered
        const name = interaction.fields.getTextInputValue('restname')
        const link = interaction.fields.getTextInputValue('link')
        const time = interaction.fields.getTextInputValue('time')

      

      const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Today\'s Food Order:🍽')
			.setDescription(`Today's Restaurant🍽:\n${name}\n\nExpired Time⏱:\n In ${time} mins \n`)
      .setURL(link)
      .setTimestamp()
      .setImage('https://i.imgur.com/DtCxaCO.jpeg');


      
      const wait = require('node:timers/promises').setTimeout
        
        const row2 = new ActionRowBuilder<any>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('foodjoin')
            .setEmoji('😋')
            .setLabel('Join')
            .setStyle(ButtonStyle.Success),
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId('foodpass')
            .setEmoji('🥺')
            .setLabel('Pass')
            .setStyle(ButtonStyle.Danger),
        );

        //the end embed

        const embed2 = new EmbedBuilder()
        .setTitle(`Today\'s Food Order ${name}`)
			  .setColor(0xFF0000)
			  .setDescription(`The Food Order ends!`)
        .setURL(link)
        .setTimestamp()

        await interaction.reply({embeds:[embed],components:[row2]})


        if(time === '10'){

          //demo countdown for 10 secs
          let timeleft = 40
          var t = setInterval(() => {
            timeleft --;
            if(timeleft>=0){
              interaction.editReply(`\n\n⏱ ===== There is ${timeleft} time left! =====⏱ \n\n`);
            }
            else{
              clearInterval(t);
            }
        }, 1000)
        
          
          await wait(1000*40) //for demo, 30secs
          await interaction.editReply({embeds:[embed2],components:[]}); //resend a message after specific seconds, the previous message will be deleted!
         
          //time's up! call API! -> show the entire order sheet to the people who triggered
          //...
          //*** UIUX!!!!
          const [status, data] = await api_get('/form');
          let msg = '';
          let all_amount = '';
          //console.log(data)
          data['data'].map( (d:any) => {
            const user = interaction.client.users.cache.get(d.clientId);
            console.log(user);
            msg += `🔅 Name : ${user?.username}\n 🔅 Food: ${d.food}\n 🔅 Number: ${d.num}\n 🔅 Total: ${d.amount}\n 🔅 Remark : ${d.remark} \n\n`
            all_amount = `${d.total_price}`
          })
          //add key value
          //msg+=all_amount
          console.log(all_amount)
          await interaction.editReply({content:msg,embeds:[embed2],components:[]}); //resend a message after specific seconds, the previous message will be deleted!

        }
        else if(time == '30'){

        let min = 30
        
          
        var t =setInterval(() => {
            min --;
            if(min>=0){
              interaction.editReply(`\n\n⏱ ===== There is ${min} min left! =====⏱ \n\n`);
            }
            else{
              clearInterval(t);
            }
            
        }, 1000*60)

          await wait(1000*30*60)
          await interaction.editReply({embeds:[embed2],components:[]});
        }
        else{

          let min = 60
          
          var t = setInterval(() => {
            min --;
            if(min>=0){
            interaction.editReply(`\n\n⏱ ===== There is  ${min}  min left! =====⏱ \n\n`);}
            else{
              clearInterval(t);
            }
        }, 1000*60)

          await wait(1000*60*60)
          await interaction.editReply({embeds:[embed2],components:[]});
        }

      
      }
      else if(interaction.customId == 'orders'){
        //const user = interaction.client.user.id
        //call api!!!!
        const food = interaction.fields.getTextInputValue('userfood')
        const num = interaction.fields.getTextInputValue('ordernum')
        const price = interaction.fields.getTextInputValue('price')
        const other = interaction.fields.getTextInputValue('other')
        //const id = interaction.fields.getTextInputValue('id')

        const data = {'clientId' : interaction.user.id,'food':food,'num':num,'amount':price,'remark':other}

        const [status, res] = await api_post('/user_form', data);

        const embed3 = new EmbedBuilder()
        .setTitle(`Thanks!`)
			  .setColor(0xFF0000)
			  .setDescription(`Hope u enjoy your meal🤓`)
        .setTimestamp()

        await interaction.reply({embeds:[embed3],ephemeral:true});

      }
      else if(interaction.customId == '1day'||interaction.customId == '1hr'||interaction.customId == '5mins'){
        //one day meeting sheet
        const type = interaction.customId
        const attend = interaction.fields.getTextInputValue('attend')
        const name = interaction.fields.getTextInputValue('meetname')
        const loc = interaction.fields.getTextInputValue('loc')
        const time = interaction.fields.getTextInputValue('time')
        const cxt = interaction.fields.getTextInputValue('content')
        
        //call api!
        const data = {'hostId' : interaction.user.id,'s_time':time,'location':loc,'content':cxt,'attendee':attend}

        const [status, res] = await api_post('/meeting', data);


        const info = new EmbedBuilder()
        .setTitle(`${type} meeting info`)
			  .setColor(0x0099FF)
			  .setDescription(`Details`)
        .addFields(
          { name: 'Topic', value: `${name}` },
          { name: 'Location', value: `${loc}`, inline: true },
          { name: 'Time', value:  `${time}` , inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Content', value:  `${cxt}` , inline: true },
        )
        .setTimestamp()

        const conf = new ActionRowBuilder<any>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('attend')
            .setEmoji('✅')
            .setLabel('Attend')
            .setStyle(ButtonStyle.Primary),
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId('reject')
            .setEmoji('❎')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger),

        )

        //set up reminder

        

        

        //the end embed

        const embed2 = new EmbedBuilder()
        .setTitle(`The meeting invitation for ${name} ENDS!`)
			  .setColor(0xFF0000)
        .setTimestamp()

        await interaction.reply({embeds:[info],components:[conf]})
        const wait = require('node:timers/promises').setTimeout

      

        if(type === '1day'){
          await wait(1000*24*60*60)
          await interaction.editReply({embeds:[embed2],components:[]});

        
        }
        else if(type === '1hr'){
          await wait(1000*60*60)
          await interaction.editReply({embeds:[embed2],components:[]});
        }
        else{ //5min emergency meet!

          let min = 20
        
          
          var t =setInterval(() => {
              min --;
              if(min>=0){
                interaction.editReply(`\n\n⏱ ===== There is ${min} time left! =====⏱ \n\n`);
              }
              else{
                clearInterval(t);
              }
              
          }, 1000)
          const today = new Date();
          await wait(1000*20) //for demo, from 5mins to 10 secs
         

          
          const [status, win] = await api_get(`/choose/${interaction.user.id}`);
          let msg = '';
          //console.log(status)
          //console.log(win)
          let tt = '';
          win['data'].map( (d:any) => {
           
            const user = interaction.client.users.cache.get(d.uId);
           msg += `🔅 Name : ${user?.username}\n🔅 Status: ${d.choose}\n\n`
           //console.log('here!!!')
           tt = `${d.s_time}`
          })


          //notify the attendees 10 mins before  the meeting
          
          const dl = new Date(tt)
          
          const cron = require('cron')

          let msg2:string = ' '
          let meetName:string = ' '

          const notify = async function(){

            win['data'].map( (d:any) => {
            const user = interaction.client.users.cache.get(d.uId);
             msg2 = `\n\n🔉 Notification :  Meeting for " ${d.content} at ${d.location} "  will start in 10 mins🔉\n Please be on time, tks!😁`
             meetName = d.content
            interaction.client.users.send(d.uId, msg2);
            return;
            })

          }
          const DL:Date = new Date(tt)
          let notify_meet = new cron.CronJob('*/60 * * * * *',notify)
          let time = (DL.getTime())-(Date.now()-1000*60*10)
          // console.log('the deadline time')
          // console.log(tt)
          // console.log(DL.getTime())
          // console.log('cur time -10 min')
          // console.log(Date.now()-1000*60*10)
          // console.log('the time')
          // console.log(time)
          
        
         // setTimeout(()=>notify_meet.start(),DL.getTime()-(Date.now()-1000*60*10))
         //目前寫死兩分鐘...
          setTimeout(()=>notify_meet.start(),1000*60*2)

        
         await interaction.editReply({content:msg,embeds:[embed2],components:[]});

          
          //await wait(1000*20)
          //await interaction.editReply({content:`The notification message for meet is sent to each attendee!😇`})
          //console.log('the meet msg is sent')
          
        }

        

        }
        else if(interaction.customId === 'reasons'){

          const embed2 = new EmbedBuilder()
          .setTitle(`Sent Successfully!🥳`)
          .setColor(0xFF0000)
          .setTimestamp()
          
          await interaction.reply({embeds:[embed2]})

        }

    })
}
