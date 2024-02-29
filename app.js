const debugMode = true; //true:テストサーバへ送信 false:本番サーバへ送信
const discord = require("discord.js");
const http = require("http");
const intent = discord.GatewayIntentBits;
const Events = discord.Events;
const client = new discord.Client(
  {
    intents: [
      intent.GuildMembers,
      intent.GuildMessages,
      intent.GuildMessageReactions,
      intent.GuildScheduledEvents,
    ]
  });
const commands = require("./commands/commands.js");
const ScheduledEventCreator = require("./ScheduledEventManager.js");
require("dotenv").config();
const scheduledEventManager = new ScheduledEventCreator(client);

http
  .createServer((req, res) => {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
      })
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000); //PORT3000でリッスンする。

client.on("ready", () => {
  console.log(`BOTの準備ができました。`);
});

client.on("guildScheduledEventUpdate", (oldEventStatus, newEventStatus) => {
  if (newEventStatus.status === 'COMPLETED'
    && newEventStatus.creatorId === process.env.BOT_ID
    && (newEventStatus.name === '火曜定例会' || newEventStatus.name === '水曜定例会')
  ) {
    const textChannelId = debugMode ? process.env.DISCORD_SEND_CHANNEL_TEST : process.env.DISCORD_SEND_CHANNEL
    scheduledEventManager.createNewRegularEvent(newEventStatus.guildId, newEventStatus.channelId, textChannelId, newEventStatus.name, new Date(newEventStatus.scheduledStartTimestamp));
  }
})

client.on("guildScheduledEventDelete", (oldEventStatus) => {
  if (oldEventStatus.creatorId === process.env.BOT_ID && (oldEventStatus.name === '火曜定例会' || oldEventStatus.name === '水曜定例会')) {
    const textChannelId = debugMode ? process.env.DISCORD_SEND_CHANNEL_TEST : process.env.DISCORD_SEND_CHANNEL
    scheduledEventManager.createNewRegularEvent(oldEventStatus.guildId, oldEventStatus.channelId, textChannelId, oldEventStatus.name, new Date(oldEventStatus.scheduledStartTimestamp));
  }
})


if (!process.env.DISCORD_BOT_TOKEN) {
  console.log("discordのBOTトークンを設定してください。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const includeCommandName = Object.keys(commands).find(val => val === interaction.commandName);

  if (includeCommandName) {
    try {
      await commands[interaction.commandName].execute(interaction)
        .then(eventData => {
          scheduledEventManager.createScheduledEvent(eventData.replacedDate, eventData.name, eventData.guildId, eventData.voiceChannelId, eventData.textChannelId);
          interaction.reply({ content: "イベントの作成が完了しました。", ephemeral: true })
        })
        .catch(err => {
          console.error(err);
          interaction.reply({ content: err, ephemeral: true }
          )
        });
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
      } else {
        await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
      }
    }
  } else {
    console.error(`${interaction.commandName}というコマンドには対応していません。`);
  }
});