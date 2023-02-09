import { Client, Collection, Events,ActionRowBuilder,StringSelectMenuBuilder} from 'discord.js'
import { AppConfig } from './config'
import { AppError, botLoginErrorOf } from './errors'
import { SlashCommand } from './types/command'
import { DiscordjsClientLoginError } from './types/response'
import * as TE from 'fp-ts/TaskEither'
import { first } from 'fp-ts/lib/Reader'

export const loginBot: (appConfig: AppConfig) => (client: Client) => TE.TaskEither<AppError, string> =
  (appConfig) => (client) =>
    TE.tryCatch(
      () => client.login(appConfig.token),
      (e) => botLoginErrorOf(`Bot Login Fail: ${(e as DiscordjsClientLoginError).code}`)
    )

export const setBotListener: (client: Client) => (commandList: Array<SlashCommand>) => void =
  (client) => (commandList) => {
    const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

    client.once(Events.ClientReady, () => {
      console.log('Bot Ready!')
    })

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      const command = commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      }
    })

    // here

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;
      //console.log(interaction);
      if (!interaction.channel) return
      console.log('Press Button')
      if (interaction.customId === 'onoffboard'){
        const row = new ActionRowBuilder<any>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_onoffboard')
            .setPlaceholder('Choose one question of On/off boarding')
            .addOptions(
              {
                label: 'Create_account 🏦',
                //description: '',
                value: 'first_option',
              },
              {
                label: 'All website and their usage 🗂',
                //description: '',
                value: 'second_option',
              },
              {
                label: 'Common problem ⁇',
                //description: '',
                value: 'third_option',
              },

            ),
        )

        await interaction.reply({ content: 'Testing!', components: [row]  })
      }
      else if(interaction.customId === 'administrative'){
        const row = new ActionRowBuilder<any>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_adm')
            .setPlaceholder('Choose one question')
            .addOptions(
              {
                label: 'Overtime hours 🕖',
                value: 'first_option',
              },
              {
                label: 'Application for reimbursement 😆',
                value: 'second_option',
              },{
                label: 'Download Documents 📃',
                value: 'third_option',
              },
            ),
        )

        await interaction.reply({ content: 'Testing!', components: [row]  })
//        await interaction.update({ content: 'Yes button was clicked!', components: [] });
      }else if(interaction.customId === 'staff'){
        const row = new ActionRowBuilder<any>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_staff')
            .setPlaceholder('Choose one question')
            .addOptions(
              {
                label: 'Gym 🏃🏻‍♂️',
                //description: 'Gym',
                value: 'first_option',
              },
              {
                label: 'Employee Benefits 🔆',
                //description: 'Employee Benefits',
                value: 'second_option',
              },
            ),
        )
        await interaction.reply({ content: 'Testing!', components: [row] })
      }else if(interaction.customId === 'recommend'){
        const row = new ActionRowBuilder<any>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_rec')
            .setPlaceholder('Choose one question')
            .addOptions(
              {
                label: 'Learning 📒',
                value: 'first_option',
              },
              {
                label: 'Languages 🔤',
                value: 'second_option',
              },
            ),
        )

        await interaction.reply({ content: 'Testing!', components: [row]  })
//        await interaction.update({ 'content': 'Yes button was clicked!', components: [] });
      }
      //collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    });

    const wait = require('node:timers/promises').setTimeout;

    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isStringSelectMenu()) return;
      if (interaction.customId === 'select_onoffboard') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'You should visit this website:....\nIf you have other problems, please contact Mr.Liu.'});
        }else if(selected === 'second_option'){
          await interaction.reply({ content: 'There are all websites you may need, and we also tell you when you will need them.'});
        }else if(selected === 'third_option'){
          await interaction.reply({ content: '📍 Where is HR\'s office?\n📍 Where can I buy dinner?\n📍 How can I apply for a bonus?'});
        }
        else await interaction.reply({ content: `${selected} was selected!`});
      }else if (interaction.customId === 'select_adm') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'You need to follow these steps:\n First,.....'});
        }else if(selected === 'second_option'){
            await interaction.reply({ content: 'You need to follow these steps:\n First,.....'});
        }else if(selected === 'third_option'){
          await interaction.reply({ content: '📍 Resignation form\n📍Reimbursement Form\n'});
      }
        else await interaction.reply({ content: `${selected} was selected!`});
      }else if (interaction.customId === 'select_staff') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'Click me to Apply for Gym!'});
        }else if(selected === 'second_option'){
            await interaction.reply({ content: '📍 Vacations\n📍Bonus\n'});
        }
        else await interaction.reply({ content: `${selected} was selected!`});
      }else if (interaction.customId === 'select_rec') {
        const selected = interaction.values[0];
        if (selected === 'first_option'){
          await interaction.reply({ content: 'We can recommend you some courses:\n'});
        }else if(selected === 'second_option'){
            await interaction.reply({ content: 'We can recommend you some courses:\n'});
        }
        else await interaction.reply({ content: `${selected} was selected!`});
      }
    })
}
