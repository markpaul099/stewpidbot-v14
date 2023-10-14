const { Events } = require("discord.js");
require("dotenv").config();

module.exports = {
	name: Events.MessageCreate,
	description: "Request Delete",
	once: false,

	async execute(message) {
		const requestCh = await message.guild.channels.cache.find(channel => channel.name === process.env.requestChannel);
		if (message.channel.id != requestCh || message.author.bot) return;

		setTimeout(() => message.delete(), 60000);

	},
};
