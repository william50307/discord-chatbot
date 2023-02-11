# Discord.js with TypeScript

use [discord.js](https://github.com/discordjs/discord.js) in TypeScript to create discord bot

## Development

- create your `.env`

```
cp .env.sample .env
```

- set your environment variable according to your app

- use `npm run dev` for developing

## Deployment

use [Google Cloud CLI](https://cloud.google.com/sdk/docs/install-sdk#linux)

```
npm run deploy
```

See [App Engin Guide](./app-engine-guide.md)


## Command introduction
After the chatbot set, you can use the instruction below.

### State
- ` /all_user_state`
    - List the state of all users.
- `/set_state`（change current personal state）
    - Set your presonal state, and you can also choose idle/ meeting/ busy.
- `/all_job `
    - list your all job and their state
    - state include : undo/ processing/ done
- `/set_job_state `
    - Choose one job and change its state
- `/assign_job`
    - You can assign jobs to your members. Then, use /all_job to see their state.
- `/last_msg`
    - Trace the last message by an user

### Tracking mesage reply
- `/emergency_message`
    -  You can send urgent messages to specific users. After the user replies, you can also receive the message by bot.
- `/emergency_message_reply`
    - Choose one of  the urgent messages you have received, and reply it.
- `/all_emergency_message`
    - List the urgent message you have received. 
- `/emergency_tag`
    - You can send urgent messages to some specific users, also choose one time to remind him again.

### Daily

- `/draw_lots`
    - Type some users and some works, and assign works to users.
- `/poll`
    - Type your theme and choices. Other users can choose one option.
- `/questions`
    - Use this command to find the solutions to your problems.
- `/meet`
    - Tag people who will need to join the upcoming meeting, set up the topic and send the meeting invitation to wait for response.
- `/food`
    - Set up food order sheets in the general channel, summarize all orders in a specific time period.
- `/meme`
    - Three types of MEMEs for people to choose and relax!


# API
we have some FastAPI code as a example, you can find it at https://github.com/Vincent826826/DCapi

***
If you have any question please contact us.
- GitHub : https://github.com/william50307
- Gamil : william5030788@gmail.com



