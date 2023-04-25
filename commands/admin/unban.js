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
		const userid = interaction.options.getString("userid");

		try {
			await interaction.guild.members.unban(userid);

			const embed = new EmbedBuilder()
				.setDescription(`Succesfully unban id: ${userid} from the server.`)
				.setColor("#2B65EC")
				.setTimestamp();

			await interaction.reply({ embeds: [embed] });
		} catch (err) {
			const errEmbed = new EmbedBuilder()
				.setDescription("Please provide a valid user's ID.")
				.setColor("#2B65EC");

			interaction.reply({ embeds: [errEmbed] });
		}
	},
};