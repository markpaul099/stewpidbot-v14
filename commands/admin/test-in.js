const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("test-in")
		.setDescription("Simulate Join")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			await interaction.client.emit("guildMemberAdd", interaction.member);
			await interaction.editReply("Emitted GuildMemberAdd");
			setTimeout(() => interaction.deleteReply(), 10000);
		} catch (error) {
			console.error("Error in test-in command:", error);
			const errorMessage = "An error occurred while simulating join. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
