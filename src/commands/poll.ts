import { poll} from 'discord.js-poll'
import { SlashCommand } from '../types/command'
import { SlashCommandBuilder, CommandInteraction, ButtonBuilder,ActionRowBuilder,ButtonStyle, EmbedBuilder} from 'discord.js'

export const PollSlashCommand: SlashCommand = {
	data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('draw lots')
	.addStringOption(option =>
		option.setName('poll_theme')
		  .setDescription('Type your theme of poll here.')
		  .setRequired(true))
	.addStringOption(option =>
			option.setName('option_poll')
			  .setDescription('Type number of options!')
			  .setRequired(true)),

	async execute(interaction: CommandInteraction) {
		if (!interaction.isChatInputCommand()) return;
		const theme = interaction?.options.getString('poll_theme')
		if (theme === null){
			await interaction.reply('There is no theme 😩');
			return;
		}
		const input_options = interaction?.options.getString('option_poll');
		const options = input_options?.split('/')
		if ((typeof options === 'undefined')){
			await interaction.reply('There is no option 🥺');
      		return;
		}

		const embed:EmbedBuilder = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(theme + ' 🪧')
			.addFields([
				{name: options[0]+' 1️⃣', value: "0", inline : true},
				{name: options[1]+' 2️⃣', value: "0", inline : true}
			])
		// -- call api

		const row:ActionRowBuilder<any> = new ActionRowBuilder<any>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('first_option')
					.setLabel(options[0])
					.setStyle(ButtonStyle.Success),
			)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('second_option')
					.setLabel(options[1])
					.setStyle(ButtonStyle.Danger),
			);

		
		await interaction.reply({ components: [row] , embeds : [embed]});
	}
}