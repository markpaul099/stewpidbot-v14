const { SlashCommandBuilder } = require("discord.js");
const moment = require("moment"); // import moment module
const os = require("os"); // import "os" module
require("moment-duration-format");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Bot's Uptime"),
	async execute(interaction) {
		const hostStr = `${os.uptime}`; // get seconds(float)

		const hostSeconds = hostStr.slice(0, -3); // convert seconds(float) to seconds(integer)
		const hostMilliseconds = hostSeconds * 1000; // Convert seconds to miliseconds
		const hostUptime = moment.duration(hostMilliseconds).format(" D [days], H [hrs], m [mins], s [secs]"); // format host uptime with moment
		const botUptime = moment.duration(interaction.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]"); // format bot uptime with moment

		console.log(`${botUptime} - ${interaction.client.uptime} - ${hostUptime} - ${hostMilliseconds}`); // used for debugging on terminal
		interaction.reply(`Bot Uptime (${interaction.client.user}): ${botUptime}\nHost Uptime (Server): ${hostUptime}`); // return uptime
	},
};
