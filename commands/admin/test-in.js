const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("test-in")
		.setDescription("Simulate Join")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			await interaction.client.emit("guildMemberAdd", interaction.member);
			await interaction.editReply("Emitted GuildMemberAdd");
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		} catch (error) {
			console.error("Error in test-in command:", error);
			const errorMessage = "An error occurred while simulating join. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
