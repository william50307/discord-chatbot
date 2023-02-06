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

    client.on(Events.InteractionCreate, interaction => {
      if (!interaction.isButton()) return;
      //console.log(interaction);

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
      else if(interaction.customId == 'foodtimes'){
        const t = interaction.values[0];
        const wait = require('node:timers/promises').setTimeout


        //the countdown embed

        const embed = new EmbedBuilder()
			  .setColor(0x0099FF)
			  .setDescription(`The Food Order will end in ${t} mins!`)
        .setTimestamp()

        //the end embed

        const embed2 = new EmbedBuilder()
			  .setColor(0xFF0000)
			  .setDescription(`The Food Order ends!`)
        .setTimestamp()

        await interaction.reply({embeds:[embed],ephemeral: true})


        if(t === 'ten'){

          //await wait(1000*60*10) //wait for 10 min to update
          await wait(1000*5) //for demo, 5 secs
          await interaction.editReply({embeds:[embed2]}); //resend a message after specific seconds, the previous message will be deleted!

        }
        else if(t == 'thirty'){
          await wait(1000*30*60)
          await interaction.editReply({embeds:[embed2]});
        }
        else{
          await wait(1000*60*60)
          await interaction.editReply({embeds:[embed2]});
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

        //after setting the order, select the time that expires
        const row = new ActionRowBuilder<any>()
        .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('foodtimes')
        .setPlaceholder(`${name} Order Expire Time`)
        .addOptions(
          {
            label: '10 mins ⏱',
            description: '10 mins to close the order!',
            value: 'ten',
          },
          {
            label: '30 mins ⏱',
            description: '30 mins to close the order!',
            value: 'thirty',
          },
          {
            label: '1 hour ⏱',
            description: '1 hour to close the order!',
            value: 'sixty',
          },

        ),
    )
      const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Today\'s Food Order:🍽')
			.setDescription(`Today's Restaurant🍽:\n${name}\n`)
      .setURL(link)
      .setTimestamp()
      .setImage('https://i.imgur.com/DtCxaCO.jpeg');
      await interaction.reply({embeds:[embed],components: [row]});
      }

    })
}
