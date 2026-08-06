const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

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
			await interaction.deferReply();
			const userId = interaction.options.getString("userid");

			try {
				await interaction.guild.members.unban(userId);

				const embed = new EmbedBuilder()
					.setDescription(`Succesfully unban id: ${userId} from the server.`)
					.setColor("#2B65EC")
					.setTimestamp();

				await interaction.editReply({ embeds: [embed] });
				setTimeout(() => interaction.deleteReply(), 10000);
			} catch (err) {
				const errEmbed = new EmbedBuilder()
					.setDescription("Please provide a valid user's ID.")
					.setColor("#2B65EC");

				await interaction.editReply({ embeds: [errEmbed] });
				setTimeout(() => interaction.deleteReply(), 10000);
			}
		} catch (error) {
			console.error("Error in unban command:", error);
			const errorMessage = "An error occurred while unbanning the user. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};