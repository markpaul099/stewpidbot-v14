const { Events } = require("discord.js");
const { findChannel } = require("../utils/channels.js");

module.exports = {
	name: Events.MessageCreate,
	description: "Request Delete",
	once: false,

	async execute(message) {
		if (!message.guild || message.author.bot) return;

		const requestCh = findChannel(message.guild, process.env.requestChannel);
		if (!requestCh || message.channel.id !== requestCh.id) return;

		setTimeout(() => message.delete().catch(() => { /* Catch */ }), 60000);

	},
};
