import { Client, GatewayIntentBits } from 'discord.js'
<<<<<<< HEAD
import { AssignJobSlashCommand } from './commands/assignjob'
import { AllUserStateSlashCommand, SetStateSlashCommand, LastMessageCommand} from './commands/state'
=======
import { EmergencyTagSlashCommand } from './commands/emergencytag'
import { SetStateSlashCommand } from './commands/setstate'
>>>>>>> 863883fe78aced1d6e920891b0121ecdcbadfe98
import { DrawLotsSlashCommand } from './commands/draw'
import { ButtonSlashCommand } from './commands/buttons'
import {DropDownSlashCommand} from './commands/dropdown'
import { deploySlashCommands } from './deploy'
import { pipe } from 'fp-ts/lib/function'
import dotenv from 'dotenv'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { sequenceS } from 'fp-ts/Apply'
import { AppError } from './errors'
import { AppConfig, readEnvironmentVariable } from './config'
import { loginBot, setBotListener } from './bot'
<<<<<<< HEAD
import { MessageTrackerSlashCommand } from './commands/messagetraker'
import { AllUserIdSlashCommand } from './commands/utils'


// register commands
const commandList = [AllUserIdSlashCommand, AllUserStateSlashCommand, AssignJobSlashCommand, LastMessageCommand, SetStateSlashCommand, DrawLotsSlashCommand, ButtonSlashCommand,DropDownSlashCommand, MessageTrackerSlashCommand]
=======
import { FoodSlashCommand } from './commands/food'
import { MeetSlashCommand } from './commands/meeting'

// register commands
const commandList = [EmergencyTagSlashCommand, SetStateSlashCommand, DrawLotsSlashCommand, ButtonSlashCommand,DropDownSlashCommand,FoodSlashCommand,MeetSlashCommand]
>>>>>>> 863883fe78aced1d6e920891b0121ecdcbadfe98

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
