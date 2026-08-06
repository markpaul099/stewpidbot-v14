const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const moment = require("moment");
const os = require("os");
require("moment-duration-format");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Bot's Uptime"),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			const hostStr = `${os.uptime}`; // get seconds(float)

			const hostSeconds = hostStr.slice(0, -3); // convert seconds(float) to seconds(integer)
			const hostMilliseconds = hostSeconds * 1000; // Convert seconds to miliseconds
			const hostUptime = moment.duration(hostMilliseconds).format(" D [days], H [hrs], m [mins], s [secs]"); // format host uptime with moment
			const botUptime = moment.duration(interaction.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]"); // format bot uptime with moment

			console.log(`${botUptime} - ${interaction.client.uptime} - ${hostUptime} - ${hostMilliseconds}`); // used for debugging on terminal
			await interaction.editReply(`Bot Uptime (${interaction.client.user}): ${botUptime}\nHost Uptime (Server): ${hostUptime}`); // return uptime
			setTimeout(() => interaction.deleteReply(), 60000);
		} catch (error) {
			console.error("Error in uptime command:", error);
			const errorMessage = "An error occurred while fetching uptime. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
