import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/command'


export const HelpSlashCommand : SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Understand all command here!')
    .addStringOption(option =>
      option.setName('problem_cat')
        .setDescription('What\'s kind of problems?')
        .setRequired(true)
        .addChoices(
          { name: 'About state', value: 'state_q' },
          { name: 'Daily task', value: 'daily_q' },
          { name: 'Message trace', value: 'msg_q' },
        )
        .setRequired(true)),

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    const problem = interaction.options.getString('problem_cat');
    
    let msg = '';
    let theme = '';
    if (problem === 'state_q'){
        theme = 'About state'
        msg = '/all_user_state\nList the state of all users.\n\n/set_state\nSet your state, and you can also choose idle/meeting/busy.\n\n/all_job\nlist your all job and their state\n\n/set_job_state \nChoose one job and change its state\n\n/assign_job\nYou can assign jobs to your members. Then, use /all_job to see their state.\n\n/last_msg\nTrace the last message by an user';
    }else if(problem === 'daily_q'){
        theme = 'Daily task'
        msg = '/emergency_message\nYou can send urgent messages to specific users. After the user replies, you can also receive the message by bot.\n\n/emergency_message_reply\nChoose one of  the urgent messages you have received, and reply it.\n\n/all_emergency_message\nList the urgent message you have received. \n\n/emergency_tag\nYou can send urgent messages to some specific users, also choose one time to remind him again.'
    }else{
        theme = 'Message trace'
        msg = '/draw_lots\nType some users and some works, and assign works to users.\n\n/poll\nType your theme and choices. Other users can choose one option.\n\n/questions\nUse this command to find the solutions to your problems.\n\n/meet\nTag people who will need to join the upcoming meeting, set up the topic and send the meeting invitation to wait for response.\n\n/food\nSet up food order sheets in the general channel, summarize all orders in a specific time period.\n\n/meme\nThree types of MEMEs for people to choose and relax!'
    }

    const embed:EmbedBuilder = new EmbedBuilder()
	 		.setColor(0x0099FF)
	 		.setTitle('Ok, You choose the '+theme+' category.')
     		.setDescription(msg);

	await interaction.reply({embeds : [embed], ephemeral:true});
  }
}
