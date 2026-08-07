const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unban a user from the server")
		.addStringOption(option =>
			option
				.setName("userid")
				.setDescription("Discord ID of the user you want to unban")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const userId = interaction.options.getString("userid");

			try {
				await interaction.guild.members.unban(userId);

				const embed = new EmbedBuilder()
					.setDescription(`Successfully unbanned user ID: ${userId} from the server.`)
					.setColor("#2B65EC")
					.setTimestamp();

				await interaction.editReply({ embeds: [embed] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);

			} catch (err) {
				const errEmbed = new EmbedBuilder()
					.setDescription("Failed to unban. Please ensure you provided a valid user ID and that the user is actually banned.")
					.setColor("#2B65EC");

				await interaction.editReply({ embeds: [errEmbed] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
			}

		} catch (error) {
			console.error("Error in unban command:", error);
			const errorMessage = "An error occurred while executing the command. Please try again.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};