import { Client, GatewayIntentBits } from 'discord.js'
import { AllJobCommand, SetJobStateCommand, AssignJobSlashCommand } from './commands/assignjob'
import { AllUserStateSlashCommand, SetStateSlashCommand, LastMessageCommand} from './commands/state'
import { DrawLotsSlashCommand } from './commands/draw'
import { ButtonSlashCommand } from './commands/buttons'
//import {DropDownSlashCommand} from './commands/dropdown'
import {questionSlashCommand} from './commands/questions'
import { deploySlashCommands } from './deploy'
import { pipe } from 'fp-ts/lib/function'
import dotenv from 'dotenv'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { sequenceS } from 'fp-ts/Apply'
import { AppError } from './errors'
import { AppConfig, readEnvironmentVariable } from './config'
import { loginBot, setBotListener } from './bot'
import { MessageTrackerSlashCommand, MessageTrackerReplySlashCommand, AllEmergencyMessageCommand } from './commands/messagetraker'

import { FoodSlashCommand } from './commands/food'
import { MeetSlashCommand } from './commands/meeting'
import {EmergencyTagSlashCommand} from './commands/emergencytag'
import {PollSlashCommand} from './commands/poll'
import {HelpSlashCommand} from './commands/help'
import { MemeSlashCommand } from './commands/meme'

// register commands

const commandList = [AllEmergencyMessageCommand, MessageTrackerReplySlashCommand, SetJobStateCommand,
  AllJobCommand,  AllUserStateSlashCommand, AssignJobSlashCommand, LastMessageCommand,
  SetStateSlashCommand, DrawLotsSlashCommand,  MessageTrackerSlashCommand,HelpSlashCommand,
  FoodSlashCommand,MeetSlashCommand,EmergencyTagSlashCommand,questionSlashCommand, PollSlashCommand,MemeSlashCommand]
dotenv.config()

// read config
const appConfig: E.Either<AppError, AppConfig> = pipe(
  {
    token: readEnvironmentVariable('TOKEN'),
    clientId: readEnvironmentVariable('CLIENT_ID'),
    guildId: readEnvironmentVariable('GUILD_ID')
  },
  sequenceS(E.Apply)
)

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

pipe(
  TE.Do,
  TE.bind('appConfig', () => TE.fromEither(appConfig)),
  TE.chainFirst(({ appConfig }) => deploySlashCommands(appConfig)(commandList)),
  TE.chainFirst(({ appConfig }) => loginBot(appConfig)(client)),
  TE.chain(() => TE.of(setBotListener(client)(commandList))),
  TE.match(
    (e) => console.log(`${e._tag}: ${e.msg}`),
    () => console.log('Deploy commands and login successfully!')
  )
)()
