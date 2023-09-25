const { Events } = require("discord.js");

module.exports = {
	name: Events.MessageCreate,
	description: "Request Delete",
	once: false,

	async execute(message) {
		const REQUEST_CH = await message.guild.channels.cache.find(channel => channel.name === "request");
		if (message.channel.id != REQUEST_CH || message.author.bot) return;

		setTimeout(() => message.delete(), 60000);

	},
};
