const { SlashCommandBuilder,VoiceChannel, TextChannel } = require('discord.js');

module.exports = {
    "ce": {
        data: new SlashCommandBuilder()
            .setName('ce')
            .addStringOption(options => 
                options
                    .setName("イベント名")
                    .setDescription("イベント名称を入力(必須)")
                    .setRequired(true)
            )
            .addStringOption(options => 
                options
                    .setName("開催日")
                    .setDescription("開催日時をyyyyMMddhhmm形式で入力(必須)")
                    .setRequired(true)
            )
            .addChannelOption(options => 
                options
                    .setName("開催チャンネル")
                    .setDescription("イベント開催時のボイスチャンネルを指定(必須)")
                    .setRequired(true)
            )
            .addChannelOption(options =>
                options
                    .setName("告知チャンネル")
                    .setDescription("イベントの告知先テキストチャンネルを指定(未指定時はコマンドを実行したテキストチャンネル)")
                    .setRequired(false)
            )
            .setDescription('新規イベントを作成します。'),
        execute: async interaction => {
            const name = interaction.options.getString('イベント名');
            const date = interaction.options.getString('開催日');
            const voiceChannel = interaction.options.getChannel('開催チャンネル')
            const textChannel = interaction.options.getChannel('告知チャンネル')

            if(!date.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/g)){
                return Promise.reject(`日時はyyyyMMddhhmm形式で入力してください。`);
            }
            const replacedDate = date.replaceAll(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/g,"$1/$2/$3 $4:$5");
            if(new Date() > new Date(replacedDate)){
                return Promise.reject(`過去の日付は指定できません。`);
            }
            if(!(voiceChannel instanceof VoiceChannel)){
                return Promise.reject(`開催場所はボイスチャンネルを指定してください。`);
            }
            if(textChannel && !(textChannel instanceof TextChannel)){
                return Promise.reject(`告知先のチャンネルはテキストチャンネルを指定してください。`);
            }

            const guildId = voiceChannel.guildId;
            const voiceChannelId = voiceChannel.id;
            const textChannelId = textChannel?.id ?? interaction.channelId;
            return {
                replacedDate: replacedDate,
                name: name,
                guildId: guildId,
                voiceChannelId: voiceChannelId,
                textChannelId: textChannelId
            };
        }
    }
}