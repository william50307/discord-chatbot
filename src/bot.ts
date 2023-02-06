import { Client, Collection, Events } from 'discord.js'
import { AppConfig } from './config'
import { AppError, botLoginErrorOf } from './errors'
import { SlashCommand } from './types/command'
import { DiscordjsClientLoginError } from './types/response'
import * as TE from 'fp-ts/TaskEither'

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

    client.on(Events.InteractionCreate, interaction => {
      if (!interaction.isButton()) return;
      //console.log(interaction);
      if(!interaction.channel) return;
      const collector = interaction.channel.createMessageComponentCollector({time: 15000 });

      collector.on('collect', async buttonInteraction => {
        console.log('hihgi')
        if (buttonInteraction.customId === 'yes'){
          await buttonInteraction.update({ content: 'Yes button was clicked!', components: [] });
          // send DM to who react
          await buttonInteraction.user.send({content : 'Yes butoon was clicked!'})
        }
        else if(buttonInteraction.customId === 'no'){
          await buttonInteraction.update({ 'content': 'No button was clicked!', components: [] });
          // send DM to who react        
          await buttonInteraction.user.send({'content' : 'No butoon was clicked!'})
        }
      });

      collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    });

    const wait = require('node:timers/promises').setTimeout;

    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isStringSelectMenu()) return;

      if (interaction.customId === 'select') {
        //await interaction.deferUpdate();
        //await wait(3000);
        const selected = interaction.values[0];
        await interaction.reply({ content: `${selected} was selected!`});
      }
    })
}
