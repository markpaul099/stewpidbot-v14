const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("test-out")
		.setDescription("Simulate Leave")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			await interaction.client.emit("guildMemberRemove", interaction.member);
			await interaction.editReply("Emited GuildMemberRemove");
			setTimeout(() => interaction.deleteReply(), 10000);
		} catch (error) {
			console.error("Error in test-out command:", error);
			const errorMessage = "An error occurred while simulating leave. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
