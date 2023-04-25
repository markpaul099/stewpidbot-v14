const { SlashCommandBuilder } = require("discord.js");
const moment = require("moment"); // import moment module
const os = require("os"); // import "os" module
require("moment-duration-format");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Bot's Uptime"),
	async execute(interaction) {
		const hoststr = `${os.uptime}`; // get seconds(float)

		const hostseconds = hoststr.slice(0, -3); // convert seconds(float) to seconds(integer)
		const hostmiliseconds = hostseconds * 1000; // Convert seconds to miliseconds
		const hostuptime = moment.duration(hostmiliseconds).format(" D [days], H [hrs], m [mins], s [secs]"); // format host uptime with moment
		const botuptime = moment.duration(interaction.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]"); // format bot uptime with moment

		console.log(`${botuptime} - ${interaction.client.uptime} - ${hostuptime} - ${hostmiliseconds}`); // used for debugging on terminal
		interaction.reply(`Bot Uptime (${interaction.client.user.username}): ${botuptime}\nR-Pi Uptime (Server): ${hostuptime}`); // return uptime
	},
};
