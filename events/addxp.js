const { Events } = require("discord.js");
const { COMMAND_CH } = require("../config.json");
const Levels = require("@markpaul099/discord-xp");

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
		const channel = await message.guild.channels.fetch(COMMAND_CH);
		if (!message.guild) return;
		if (message.author.bot) return;

		const randomAmountOfXp = Math.floor(Math.random() * 29) + 1; // Min 1, Max 30
		const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomAmountOfXp);
		if (hasLeveledUp) {
			const user = await Levels.fetch(message.author.id, message.guild.id);
			channel.send({ content: `${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:` });
		}
	},
};
