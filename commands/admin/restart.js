const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restart Bot")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			// Shutdown bot and let PM2 restart the bot
			await interaction.editReply("Restarting...");
			setTimeout(() =>
				interaction.editReply("Bot Restarted").catch(() => {/* Catch */ }), 3000);

			setTimeout(() => {
				interaction.client.destroy();
				process.exit(0);
			}, 4000);
		} catch (error) {
			console.error("Error in restart command:", error);
			const errorMessage = "An error occurred while restarting the bot.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	},
};
