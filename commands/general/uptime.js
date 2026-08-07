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
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const hostSeconds = os.uptime();
			const hostMilliseconds = hostSeconds * 1000;

			const hostUptime = moment.duration(hostMilliseconds).format(" D [days], H [hrs], m [mins], s [secs]");
			const botUptime = moment.duration(interaction.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");

			console.log(`${botUptime} - ${interaction.client.uptime} - ${hostUptime} - ${hostMilliseconds}`);

			await interaction.editReply({
				content: `Bot Uptime (${interaction.client.user}): ${botUptime}\nHost Uptime (Server): ${hostUptime}`,
			});

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 60000);

		} catch (error) {
			console.error("Error in uptime command:", error);
			const errorMessage = "An error occurred while fetching uptime. Please try again.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};