const debugMode = true; //true:テストサーバへ送信 false:本番サーバへ送信
const discord = require("discord.js");
const http = require("http");
const intent = discord.Intents.FLAGS;
const formatDate = require("date-fns-timezone");
const client = new discord.Client(
  {
    intents:[intent.GUILDS,intent.GUILD_MEMBERS,intent.GUILD_MESSAGES,intent.GUILD_MESSAGE_REACTIONS,intent.GUILD_SCHEDULED_EVENTS]
  });
require("dotenv").config();
const embedMessages = require("./assets/embedMessages");
let regularEventId; //前回スケジューリングしたイベントのID

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
            askSchedule(query.eventStartDate);
            res.end();
            return;
        }else if(type === "wake"){
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
      regularEventId = event.id;
      const scheduledTime = new Date(event.scheduledStartTimestamp + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
      const textMessageSendingChannel = debugMode ? process.env.DISCORD_SEND_CHANNEL_TEST : process.env.DISCORD_SEND_CHANNEL
      const inviteOptions = {
        maxAge:60*60*24*7 //1週間分
      }
      event.createInviteURL(inviteOptions).then(url => {
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

client.on("guildScheduledEventUpdate",(oldEventStatus,newEventStatus) => {
  //定例会用のイベント(このbotが作成したイベント)が終了したときだけ、次の定例会を作成する。
  if(newEventStatus.status === 'COMPLETED' && newEventStatus.id === regularEventId){
    const date = formatDate.convertToTimeZone(new Date(),{timeZone:'Asia/Tokyo'});
    //水曜定例 -> 金曜定例(2日後)
    if(date.getDay() === 3){
      date.setDate(date.getDate() + 2);
    }else{
    //金曜定例 -> 水曜定例(5日後)
      date.setDate(date.getDate() + 5);
    }
    date.setHours(21,0,0,0);
    console.log(date);
    askSchedule(date.toGMTString());
  }
})


if (!process.env.DISCORD_BOT_TOKEN) {
  console.log("discordのBOTトークンを設定してください。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

const askSchedule = (eventStartDateString) => {
  const voiceChannelId = debugMode ? process.env.DISCORD_VOICE_CHANNEL_TEST : process.env.DISCORD_VOICE_CHANNEL;
  const voiceChannel = client.channels.cache.find(e => e.channelId = voiceChannelId);
  const eventStartDate = new Date(eventStartDateString);
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
}