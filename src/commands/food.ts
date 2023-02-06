import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,ModalBuilder,TextInputBuilder, TextInputStyle,StringSelectMenuBuilder } from 'discord.js'
import { boolean } from 'io-ts';
import { SlashCommand } from '../types/command'

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
    
    //build menu for time selections

    const row = new ActionRowBuilder<any>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('times')
        .setPlaceholder('Order Expire Time')
        .addOptions(
          {
            label: '10 mins ⏱',
            description: '10 mins to close the order!',
            value: 'first_option',
          },
          {
            label: '30 mins ⏱',
            description: '30 mins to close the order!',
            value: 'second_option',
          },
          {
            label: '1 hour ⏱',
            description: '1 hour to close the order!',
            value: 'third_option',
          },

        ),

    )

		// An action row only holds one text input,
		// so you need one action row per text input.
		  const firstActionRow = new ActionRowBuilder<any>().addComponents(name);
		  const secondActionRow = new ActionRowBuilder<any>().addComponents(menu);
      const thirdActionRow = new ActionRowBuilder<any>().addComponents(row);

      modal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(modal)
      


    // -- call api 
    // const row:ActionRowBuilder = new ActionRowBuilder()
		// 	.addComponents(
		// 		new ButtonBuilder()
		// 			.setCustomId('yes')
		// 			.setLabel('Yes')
		// 			.setStyle(ButtonStyle.Success),
		// 	)
    //   .addComponents(
		// 		new ButtonBuilder()
		// 			.setCustomId('no')
		// 			.setLabel('No')
		// 			.setStyle(ButtonStyle.Danger),
		// 	);

      // // meeting info
      // const embed:EmbedBuilder = new EmbedBuilder()
			// .setColor(0x0099FF)
			// .setTitle('Meeting Ivitation')
			// .setDescription('write meeting info here');

	//	await interaction.reply({components: [row]});
  }
}
