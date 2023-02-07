import { Client, Collection, Events } from 'discord.js'
import { AppConfig } from './config'
import { AppError, botLoginErrorOf } from './errors'
import { SlashCommand } from './types/command'
import { DiscordjsClientLoginError } from './types/response'
import * as TE from 'fp-ts/TaskEither'
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,ModalBuilder,TextInputBuilder, TextInputStyle,StringSelectMenuBuilder } from 'discord.js'
export const loginBot: (appConfig: AppConfig) => (client: Client) => TE.TaskEither<AppError, string> =
  (appConfig) => (client) =>
    TE.tryCatch(
      () => client.login(appConfig.token),
      (e) => botLoginErrorOf(`Bot Login Fail: ${(e as DiscordjsClientLoginError).code}`)
    )

export const setBotListener: (client: Client) => (commandList: Array<SlashCommand>) => void =
  (client) => (commandList) => {
    const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

    client.once(Events.ClientReady, () => {
      console.log('Bot Ready!')
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
      
     const collector = interaction.channel.createMessageComponentCollector({time: 15000 });

      collector.on('collect', async buttonInteraction => {
        console.log('hihgi')
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
        const joint = interaction.client.user.username


        const embed3 = new EmbedBuilder()
        .setTitle(`Great! ${joint} will join this meeting`)
        .setColor(0xFFD733)
        .setDescription(`The bot will remind you 10 mins before the meeting starts!🥳`)
        .setTimestamp()
        //call api to store the user who confirmed to attend the meeting
        //...
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

    });

    const wait = require('node:timers/promises').setTimeout;

    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isStringSelectMenu()) return;

      

      if (interaction.customId === 'select') {
        //await interaction.deferUpdate();
        //await wait(3000);
        const selected = interaction.values[0];
        await interaction.reply({ content: `${selected} was selected!`});
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
      
      //modal for food
      if (interaction.customId === 'foodies') {
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
          let timeleft = 10
          var t = setInterval(() => {
            timeleft --;
            if(timeleft>=0){
              interaction.editReply(`\n\n⏱ ===== There is ${timeleft} time left! =====⏱ \n\n`);
            }
            else{
              clearInterval(t);
            }
        }, 1000)
        
          
          await wait(1000*10) //for demo, 30secs
          await interaction.editReply({embeds:[embed2],components:[]}); //resend a message after specific seconds, the previous message will be deleted!
         
          //time's up! call API! -> show the entire order sheet to the people who triggered
          //...
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
        const name = interaction.fields.getTextInputValue('meetname')
        const loc = interaction.fields.getTextInputValue('loc')
        const time = interaction.fields.getTextInputValue('time')
        const cxt = interaction.fields.getTextInputValue('content')

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
        else{

          let min = 30
        
          
          var t =setInterval(() => {
              min --;
              if(min>=0){
                interaction.editReply(`\n\n⏱ ===== There is ${min} time left! =====⏱ \n\n`);
              }
              else{
                clearInterval(t);
              }
              
          }, 1000)

          await wait(1000*30) //for demo, from 5mins to 30 secs
          await interaction.editReply({embeds:[embed2],components:[]});
          
        }

        

        }
        else if(interaction.customId == 'reasons'){

          const embed2 = new EmbedBuilder()
          .setTitle(`Sent Successfully!🥳`)
          .setColor(0xFF0000)
          .setTimestamp()
          
          await interaction.reply({embeds:[embed2]})

        }

    })
}
