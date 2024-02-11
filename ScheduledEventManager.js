
const formatDate = require("date-fns-timezone");
const discord = require('discord.js');
const embedMessages = require('./assets/embedMessages');
require("dotenv").config();

module.exports = class ScheduledEventManager {
    constructor(client){
        this.client = client;
    }

    createScheduledEvent(eventStartDateString, name, guildId, voiceChannelId,textChannelId){
        const voiceChannel = this.client.channels.cache.find(e => e.id === voiceChannelId);
        const eventStartDate = formatDate.convertToTimeZone(new Date(eventStartDateString), { timeZone: 'Asia/Tokyo' });
        const guild = this.client.guilds.cache.get(guildId);
        const eventDetail = {
            "name": `${name}`,
            "scheduledStartTime": `${eventStartDate}`,
            "privacyLevel": 2, //GUILD_ONLY
            "entityType": 2, //VOICE
            "channel": voiceChannel.id
        }
        const eventManager = new discord.GuildScheduledEventManager(guild);
        eventManager.create(eventDetail).then(res => this.sendEventMessage(res,textChannelId))
        return true;
    }

    createNewRegularEvent(guildId, voiceChannelId,textChannelId){
        const date = formatDate.convertToTimeZone(new Date(), { timeZone: 'Asia/Tokyo' });
        //水曜定例(水曜日か、木曜日に終了する。金曜日の定例会を作成したい。)
        if (date.getDay() === 3 || date.getDay() === 4) {
            const fridayDate = (5 - date.getDay() + 7) % 7;
            date.setDate(date.getDate() + fridayDate);
        } else {
            //金曜定例 -> 水曜定例を作る
            const wednesdayDate = (3 - date.getDay() + 7) % 7;
            date.setDate(date.getDate() + wednesdayDate);
        }
        date.setHours(21, 0, 0, 0);
        this.createScheduledEvent(date.toGMTString(),"定例会",guildId, voiceChannelId,textChannelId);
    }

    sendEventMessage(event,textMessageSendingChannel){
        const scheduledTime = new Date(event.scheduledStartTimestamp + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
        this.client.channels.fetch(textMessageSendingChannel).then(textChannel => {
            const inviteOptions = {
              maxAge: 60 * 60 * 24 * 7 //1週間分
            }
            event.createInviteURL(inviteOptions).then(url => {
              textChannel.send(embedMessages.scheduledMessage(this.client, scheduledTime, event.name)).then(() => {
                textChannel.send(url);
              })
            });
        })
        return true;
    }
}