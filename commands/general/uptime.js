const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const os = require("os");
const { formatDuration } = require("../../utils/format.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Bot's Uptime"),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const hostUptime = formatDuration(os.uptime() * 1000);
			const botUptime = formatDuration(interaction.client.uptime);

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
