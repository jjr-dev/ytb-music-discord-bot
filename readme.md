# 🎵 YTB Music

A bot for Discord in NodeJs to play music from YouTube with a queue system and slash command support.

## ⚙️ How to install

1. Clone the repository using the `<> Code` button

```
git clone https://github.com/jjr-dev/ytb-music-discord-bot.git
```

2. Create the `configs.json` configuration file

```
{
  "token": "discord_bot_token",
  "client": "discord_bot_id"
}
```

> Settings credentials can be obtained [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

3. Add the bot to your server. If you don't know how to do it, [click here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links).

4. Install the dependencies and start the bot

```
npm install
npm start
```

5. Add the slash commands with the `deploy-commands.js` file

```
node deploy-commands.js
```

## 💿 How to use

The bot supports slash commands and therefore its usability is quite simple and fast. The available commands are:

- `/ping` Get ping from server
- `/play  [music*]` | Play or add a song
- `/pause` Pause a song
- `/skip` Skip a song
- `/repeat` Repeat a song
- `/leave` Stop playing song
- `/queue [page]` List songs queue
- `/volume [volume]` Change song volume
  > Volume can be set between `0.1` and infinity, where `1` is `100%`.

Submitting music for playback can be performed by name (or part of it), video URL or playlist URL, examples:

```
/play Lil Nas X - HOLIDAY
/play https://youtu.be/9vMLTcftlyI
/play https://www.youtube.com/watch?v=9vMLTcftlyI&ab_channel=LilNasXVEVO
/play https://www.youtube.com/watch?v=6swmTBVI83k&list=PLaJrsJZtcK8O_X5xxvfidfMtB8Z8uycvo
```

## 👋🏻 Bye

Feel free to make changes, suggest updates or use it on your servers. A single instance can play music on multiple servers simultaneously.
