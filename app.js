const discord = require("discord.js");
const http = require("http");
const URLSearchParams = require("url-search-params");
const intent = discord.Intents.FLAGS;
const client = new discord.Client(
  {
    intents:[intent.GUILDS,intent.GUILD_MEMBERS,intent.GUILD_MESSAGES,intent.GUILD_MESSAGE_REACTIONS,intent.GUILD_SCHEDULED_EVENTS]
  });
require("dotenv").config();

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
        const query = JSON.parse(data);
        console.log(query)
        const type = query.type;
        console.log("post:" + type);
        if (type === "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        if (type === "askSchedule") {
            console.log("askSchedule")
            const voiceChannel = client.channels.cache.find(e => e.channelId = process.env.DISCORD_SEND_CHANNEL);
            const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
            //後で環境変数に追加する。
            const eventDetail = {
              name:"テスト",
              scheduledStartTime:'2022-05-25',
              privacyLevel:2, //GUILD_ONLY
              entityType:2, //VOICE
              channel:voiceChannel.channelId
            }
            const eventManager = new discord.GuildScheduledEventManager(guild);
            eventManager.create(eventDetail);
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

client.on("messageCreate", (message) => {
  if (message.author.id === client.user.id) {
    return;
  }
  console.log(message.content);

  if (message.content.includes(`<:Craig:969537767585493022>, 終了`)) {
    message.reply(`udonariumのルーム情報は保存した？`);
  }
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.log("discordのBOTトークンを設定してください。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);
