import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder} from 'discord.js'
import { SlashCommand } from '../types/command'

const wait = require('node:timers/promises').setTimeout;

export const DropDownSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('drop_down')
    .setDescription('drop down list testing'),

  async execute(interaction: CommandInteraction) {
    const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions(
						{
							label: 'Select me',
							description: 'This is a description',
							value: 'first_option',
						},
						{
							label: 'You can select me too',
							description: 'This is also a description',
							value: 'second_option',
						},
					),
			);

		await interaction.reply({ content: 'Testing!' });
  }
}
