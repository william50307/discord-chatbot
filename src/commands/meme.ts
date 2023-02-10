import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import { boolean } from 'io-ts';
import { SlashCommand } from '../types/command'

const wait = require('node:timers/promises').setTimeout;

export const MemeSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Choose a type of MEME 🤓 !'),

  async execute(interaction: CommandInteraction) {

    if (!interaction.isChatInputCommand()) return;
    const state = interaction.options.getString('state');
    // -- call api 
    const row:ActionRowBuilder<any> = new ActionRowBuilder<any>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('lol')
					.setLabel('LOL😗')
					.setStyle(ButtonStyle.Primary),
			)
      .addComponents(
				new ButtonBuilder()
					.setCustomId('cured')
					.setLabel('Feeling Cured🥴')
					.setStyle(ButtonStyle.Success),
			)
      .addComponents(
				new ButtonBuilder()
					.setCustomId('engineer')
					.setLabel('Engineer HeHe🥶')
					.setStyle(ButtonStyle.Danger),
			);

      // meeting info
      // const embed:EmbedBuilder = new EmbedBuilder()
			// .setColor(0x0099FF)
			// .setTitle('Meeting Ivitation')
			// .setDescription('write meeting info here');

		await interaction.reply({ content: 'Feeling tired?? Enjoy MEMEs!!! 🤑\n\n',files:['./src/bro-high-five.mp4'], components: [row] });
  }
}
