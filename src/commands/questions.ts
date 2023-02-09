import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import { boolean } from 'io-ts';
import { SlashCommand } from '../types/command'

const wait = require('node:timers/promises').setTimeout;

export const questionSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('questions')
    .setDescription('Find solutions of you question here!'),

  async execute(interaction: CommandInteraction) {

    const button = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('onoffboard')
            .setLabel('On/Off board')
            .setStyle(ButtonStyle.Primary))
    .addComponents(
        new ButtonBuilder()
        .setCustomId('administrative')
        .setLabel('Administrative affairs')
        .setStyle(ButtonStyle.Danger))
    .addComponents(
        new ButtonBuilder()
        .setCustomId('staff')
        .setLabel('Staff Service')
        .setStyle(ButtonStyle.Secondary)
    )
    .addComponents(
        new ButtonBuilder()
        .setCustomId('recommend')
        .setLabel('Recommend')
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
        new ButtonBuilder()
        .setURL('https://www.tsmc.com/chinese')
        .setLabel('Link to TSMC')
        .setStyle(ButtonStyle.Link)
    )
		await interaction.reply({ content: 'Select one button!'
        , components: [button]
    });
  }
}
