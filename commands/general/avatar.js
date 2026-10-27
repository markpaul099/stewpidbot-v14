const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Show a user's avatar in full size")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("Whose avatar to show (defaults to you)")
				.setRequired(false))
		.addBooleanOption(option =>
			option
				.setName("server")
				.setDescription("Show their server avatar instead of their main one, if they have one")
				.setRequired(false)),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			const user = interaction.options.getUser("user") ?? interaction.user;
			const useServerAvatar = interaction.options.getBoolean("server") ?? false;
			const member = useServerAvatar ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;

			const avatarSource = member ?? user;
			const url = avatarSource.displayAvatarURL({ size: 4096 });

			const embed = new EmbedBuilder()
				.setColor("#2B65EC")
				.setTitle(`${member?.displayName ?? user.displayName}'s avatar`)
				.setURL(url)
				.setImage(url);

			await interaction.editReply({ embeds: [embed] });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 60000);
		} catch (error) {
			console.error("Error in avatar command:", error);
			const errorMessage = "An error occurred while fetching the avatar. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.deleteReply().catch(() => { /* Catch */ });
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
