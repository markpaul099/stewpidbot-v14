const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { findChannel } = require("../../utils/channels.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unban a user from the server")
		.addStringOption(option =>
			option
				.setName("userid")
				.setDescription("Discord ID of the user you want to unban")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const userId = interaction.options.getString("userid").trim();

			const errEmbed = new EmbedBuilder().setColor("#2B65EC");

			if (!/^\d{17,20}$/.test(userId)) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(`\`${userId}\` is not a valid user ID.`)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
			if (!ban) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(`User ID ${userId} is not banned from this server.`)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			await interaction.guild.members.unban(userId, `Unbanned by ${interaction.user.username}`);

			const embed = new EmbedBuilder()
				.setDescription(`Successfully unbanned ${ban.user.username} from the server.\nUser ID: ${userId}`)
				.setColor("#2B65EC")
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);

			const logs = findChannel(interaction.guild, process.env.logsChannel);
			if (logs) {
				await logs.send({ embeds: [embed] }).catch(() => { /* Catch */ });
			}

		} catch (error) {
			console.error("Error in unban command:", error);
			const errorMessage = "An error occurred while unbanning the user. Please try again.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
