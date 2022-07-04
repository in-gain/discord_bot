const debugMode = false; //true:テストサーバへ送信 false:本番(TRPGサーバ)へ送信
const discord = require("discord.js");
const http = require("http");
const intent = discord.Intents.FLAGS;
const client = new discord.Client(
  {
    intents:[
      intent.GUILDS,
      intent.GUILD_MEMBERS,
      intent.GUILD_MESSAGES,
      intent.GUILD_MESSAGE_REACTIONS,
      intent.GUILD_SCHEDULED_EVENTS
    ]
  });
require("dotenv").config();
const embedMessages = require("./assets/embedMessages");

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
        const type = query.type;
        if (type === "askSchedule") {
            const voiceChannelId = debugMode ? process.env.DISCORD_VOICE_CHANNEL_TEST : process.env.DISCORD_VOICE_CHANNEL;
            const eventStartDate = new Date(query.eventStartDate);
            const voiceChannel = client.channels.cache.find(e => e.channelId = voiceChannelId);
            const guildId = debugMode ? process.env.DISCORD_GUILD_ID_TEST : process.env.DISCORD_GUILD_ID;
            const guild = client.guilds.cache.get(guildId);
            const eventDetail = {
              name:"定例会",
              scheduledStartTime:`${eventStartDate}`,
              privacyLevel:2, //GUILD_ONLY
              entityType:2, //VOICE
              channel:voiceChannel.channelId
            }
            const eventManager = new discord.GuildScheduledEventManager(guild);
            eventManager.create(eventDetail);
            res.end();
            return;
        }else if(type === "wake"){
          console.log("wake up discord");
          res.end();
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
  if (client.user.bot) {
    return;
  }
  console.log(message.content);

  if (message.content.includes(`<:Craig:969537767585493022>, 終了`)) {
    message.reply(`udonariumのルーム情報は保存した？`);
  }
});

client.on("guildScheduledEventCreate",(event) => {
    if(event.creator?.bot){
      console.log("event create");
      const scheduledTime = new Date(event.scheduledStartTimestamp + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
      const textMessageSendingChannel = debugMode ? process.env.DISCORD_SEND_CHANNEL_TEST : process.env.DISCORD_SEND_CHANNEL
      event.createInviteURL().then(url => {
        client.channels.cache.get(textMessageSendingChannel).send(embedMessages.scheduledMessage(client,scheduledTime));
        client.channels.cache.get(textMessageSendingChannel).send(url);
      });
    }
})

client.on("guildScheduledEventUserAdd",(event,user) =>{
  console.log("userAdd");
  console.log(event);
  console.log(user);
})

client.on("guildScheduledEventUserRemove",(event,user) =>{
  console.log("userRemove");
  console.log(event);
  console.log(user);
})


if (!process.env.DISCORD_BOT_TOKEN) {
  console.log("discordのBOTトークンを設定してください。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);
