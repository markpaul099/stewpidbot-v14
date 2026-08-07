const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restart the bot (Requires PM2 or similar process manager)")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			await interaction.editReply({ content: "Restarting... bot will be back shortly." }).catch(() => { /* Catch */ });
			setTimeout(() => {
				interaction.client.destroy();
				process.exit(0);
			}, 2000);

		} catch (error) {
			console.error("Error in restart command:", error);
			const errorMessage = "An error occurred while attempting to restart the bot.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};