
const formatDate = require("date-fns-timezone");
const discord = require('discord.js');
const embedMessages = require('./assets/embedMessages');
require("dotenv").config();

const date = {
    mon:1,
    tue:2,
    wed:3,
    thu:4,
    fri:5,
    sat:6,
    sun:7
}

module.exports = class ScheduledEventManager {
    constructor(client){
        this.client = client;
    }

    createScheduledEvent(eventStartDateString, name, guildId, voiceChannelId,textChannelId){
        const voiceChannel = this.client.channels.cache.find(e => e.id === voiceChannelId);
        const eventStartDate = new Date(eventStartDateString);
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

    createNewRegularEvent(guildId, voiceChannelId,textChannelId,eventName,eventDate){
        let newEventName;
        if (eventName.includes('火曜')) {
            const wednesdayDate = (date['wed'] - eventDate.getDay() + 7) % 7;
            newEventName = '水曜定例会'
            eventDate.setDate(eventDate.getDate() + wednesdayDate);
        } else {
            newEventName ='火曜定例会'
            const tuesdayDate = (date['tue'] - eventDate.getDay() + 7) % 7;
            eventDate.setDate(eventDate.getDate() + tuesdayDate);
        }
        eventDate.setHours(21, 0, 0, 0);
        this.createScheduledEvent(eventDate.toGMTString(),newEventName,guildId, voiceChannelId,textChannelId);
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