import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,ModalBuilder,TextInputBuilder, TextInputStyle,StringSelectMenuBuilder } from 'discord.js'
import { boolean } from 'io-ts';
import { SlashCommand } from '../types/command'
import { api_get, api_post, api_put } from '../api';

const wait = require('node:timers/promises').setTimeout;

export const FoodSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('food')
    .setDescription('for food orders'),
    // .addStringOption(option =>
    //   option.setName('state')
    //     .setDescription('The gif category')
    //     .setRequired(true)
    //     .addChoices(
    //       { name: 'idle', value: 'idle' },
    //       { name: 'meeting', value: 'meeting' },
    //       { name: 'busy', value: 'busy' },
    //     )
    //     .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    //const state = interaction.options.getString('state');

          //call api
      const data = {'hostId' : interaction.user.id}
      console.log(data)
      const [status, res] = await api_post('/form', data);
      const idd = res['fId']
      console.log(idd)
    
    //order sheets
    const modal = new ModalBuilder()
			.setCustomId('foodies')
			.setTitle('Food Orders🍖');

    const name = new TextInputBuilder()
			.setCustomId('restname')
		    // The label is the prompt the user sees for this input
			.setLabel("Restaurant:")
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const menu = new TextInputBuilder()
			.setCustomId('link')
			.setLabel("Menu Link:")
			.setStyle(TextInputStyle.Short);
    
    const exp = new TextInputBuilder()
			.setCustomId('time')
			.setLabel("Order Expired Time(10/30/60min):")
      .setValue('10')
			.setStyle(TextInputStyle.Short);
    // const id = new TextInputBuilder()
    // .setCustomId('id')
    // .setLabel("SHEET ID (DO NOT MODIFY)")
    // .setValue(`${idd}`)
    // .setStyle(TextInputStyle.Short);
    
    //build menu for time selections



		// An action row only holds one text input,
		// so you need one action row per text input.
		  const firstActionRow = new ActionRowBuilder<any>().addComponents(name);
		  const secondActionRow = new ActionRowBuilder<any>().addComponents(menu);
      const thirdActionRow = new ActionRowBuilder<any>().addComponents(exp);
      //const forthActionRow = new ActionRowBuilder<any>().addComponents(id);


      modal.addComponents(firstActionRow, secondActionRow,thirdActionRow);
      await interaction.showModal(modal)
      
  }
}
