const discord = require("discord.js");
const http = require("http");
const URLSearchParams = require("url-search-params");
const intent = discord.Intents.FLAGS;
const client = new discord.Client(
  {
    intents:[intent.GUILDS,intent.GUILD_MEMBERS,intent.GUILD_MESSAGE_REACTIONS,intent.GUILD_SCHEDULED_EVENTS]
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
        var dataObject = URLSearchParams.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type === "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        if (dataObject.type === "askSchedule") {
            console.log("askSchedule")
            const sendChannel = client.channels.cache.find(e => e.channelId = `806884040178925632`)
            //後で環境変数に追加する。
            const eventDetail = {
              name:"テスト",
              scheduledStartTime:new Date(),
              privacyLevel:2, //GUILD_ONLY
              entityType:2, //VOICE
              channel:sendChannel
            }
            const eventManager = new discord.GuildScheduledEventManager(client);
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

client.on("message", (message) => {
  if (message.author.id === client.user.id) {
    return;
  }
  console.log(message.content);

  if (message.content.includes(`:Craig:, 終了`)) {
    message.reply(`udonariumのルーム情報は保存した？`);
  }
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.log("discordのBOTトークンを設定してください。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);
