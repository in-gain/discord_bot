const { REST, Routes } = require('discord.js');

const debugMode = true; //true:テストサーバに登録 false:本番サーバに登録

const commands = require('./commands/commands.js');

require('dotenv').config();

const slashCommands = Object.keys(commands).map(val => commands[val].data.toJSON());

const token = process.env.DISCORD_BOT_TOKEN;
const rest = new REST({ version: '10' }).setToken(token);

const applicationId = process.env.BOT_ID;

const guildId = debugMode ? process.env.DISCORD_GUILD_ID_TEST : process.env.DISCORD_GUILD_ID;

(async () => {
    try {
        await rest.put(
			Routes.applicationGuildCommands(applicationId, guildId),
			{ body: slashCommands },
		);
        console.log('サーバー固有のコマンドが登録されました！');
    } catch (error) {
        console.error('コマンドの登録中にエラーが発生しました:', error);
    }
})();