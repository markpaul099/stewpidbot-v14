const { Events } = require("discord.js");

module.exports = {
	name: Events.MessageCreate,
	description: "Request Delete",
	once: false,

	async execute(message) {
		const requestCh = message.guild.channels.cache.find(c => c.name === process.env.requestChannel);
		if (message.channel.id != requestCh || message.author.bot) return;

		setTimeout(() => message.delete(), 60000);

	},
};
