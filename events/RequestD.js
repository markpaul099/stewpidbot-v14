const { Events } = require("discord.js");
const { REQUEST_CH } = require("../config.json");

module.exports = {
	name: Events.MessageCreate,
	description: "Request Delete",
	once: false,

	async execute(message) {
		if (message.channel.id != REQUEST_CH || message.author.bot) return;

		setTimeout(() => message.delete(), 60000);

	},
};
