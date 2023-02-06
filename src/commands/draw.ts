import { SlashCommandBuilder, CommandInteraction} from 'discord.js'
import { SlashCommand } from '../types/command'

export const DrawLotsSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('draw_lots')
    .setDescription('draw lots')
    .addStringOption(option =>
      option.setName('users')
        .setDescription('users to draw lot')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winner_num')
        .setDescription('how many winners')
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    // user id format is : <@...>
    // regular expression?

    if (!interaction.isChatInputCommand()) return;
    const input_users = interaction?.options.getString('users');
    const users = input_users?.split(' ')
    if (typeof users === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }
    // get user input
    
    const winner_num = interaction.options.getInteger('winner_num');
    if(!winner_num){
      await interaction.reply('there is no winner_num');
      return;
    }

    if (winner_num > users.length ?? 0){
      await interaction.reply('OOPS! the lot number exceed the number of participants')
    }
    // shuffle the candidates 
    const shuffled:string[] = users.sort(() => 0.5 - Math.random());
    // get N winners 
    const winners:string[] = shuffled.slice(0, winner_num);

    // response message
    let msg:string = 'The winner is : ';
    for (const winner of winners){
      let user = interaction.client.users.cache.get(winner.slice(2,-1));
      msg += ` ${user} `
    } 
    await interaction.reply(msg)
  }
}