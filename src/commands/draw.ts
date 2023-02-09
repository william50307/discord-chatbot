import { SlashCommandBuilder, CommandInteraction} from 'discord.js'
import internal from 'stream';
import { SlashCommand } from '../types/command'

export const DrawLotsSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('draw_lots')
    .setDescription('draw lots')
    .addStringOption(option =>
      option.setName('users')
        .setDescription('users to draw lot')
        .setRequired(true))
    .addStringOption(option =>
          option.setName('workandnums')
            .setDescription('Input Works and number of people?(work1_2/work2_3)')
            .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    // user id format is : <@...>
    // regular expression?

    if (!interaction.isChatInputCommand()) return
    const input_users = interaction?.options.getString('users');
    const users = input_users?.split(' ')
    if (typeof users === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }
    // get user input
    if (!interaction.isChatInputCommand()) return
    const workAndNums = interaction?.options.getString('workandnums');
    const all_works = workAndNums?.split('/')
    if (typeof all_works === 'undefined'){
      await interaction.reply('there are users in input string');
      return;
    }
    const works:string[] = new Array();
    var winner_num:number = 0;
    for (const workNum of all_works){
      const work:string = workNum?.split('_')[0]
      var num:number = +workNum?.split('_')[1]
      //console.log(work)
      var i:number = 1
      while(i<=num) {
        works.push(work)
        i++
      }
      winner_num = winner_num + num
    }

    if (winner_num > users.length ?? 0){
      await interaction.reply('OOPS! the lot number exceed the number of participants')
    }
    // shuffle the candidates
    const shuffled:string[] = users.sort(() => 0.5 - Math.random());
    // get N winners
    const winners:string[] = shuffled.slice(0, winner_num);

    // response message
    let msg:string = '~~~~~The result is~~~~~\n';
    var i:number = 0;
    console.log(winner_num)
    for (const winner of winners){
      msg += works[i].toString()
      msg += ':'.toString()
      let user = interaction.client.users.cache.get(winner.slice(2,-1));
      msg += ` ${user} `
      msg += '\n'.toString()
      i+=1
      console.log(user?.id)
    }
    await interaction.reply(msg)
  }
}