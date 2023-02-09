import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import { boolean } from 'io-ts';
import { SlashCommand } from '../types/command'

const wait = require('node:timers/promises').setTimeout;

export const ButtonSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('button')
    .setDescription('Find solutions of you question here!')
    .addStringOption(option =>
      option.setName('state')
        .setDescription('The gif category')
        .setRequired(true)
        .addChoices(
          { name: 'idle', value: 'idle' },
          { name: 'meeting', value: 'meeting' },
          { name: 'busy', value: 'busy' },
          { name: 'vacation', value: 'vacation' },
        )
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return
    const state = interaction.options.getString('state');
    // -- call api
    const row:ActionRowBuilder = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('yes')
					.setLabel('Yes')
					.setStyle(ButtonStyle.Success),
			)
      .addComponents(
				new ButtonBuilder()
					.setCustomId('no')
					.setLabel('No')
					.setStyle(ButtonStyle.Danger),
			);

      // meeting info
      const embed:EmbedBuilder = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Meeting Ivitation')
			.setDescription('write meeting info here');

		await interaction.reply({ content: 'Can you join the meeting?', embeds: [embed], components: [] });
  }
}
