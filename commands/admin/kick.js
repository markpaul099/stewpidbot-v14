const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { findChannel } = require("../../utils/channels.js");
const { moderationBlocker } = require("../../utils/permissions.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("Kick a user from the server")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("The user to kick")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("The reason for the kick")
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const user = interaction.options.getUser("user");
			const reason = interaction.options.getString("reason") || "No reason provided";

			const member = await interaction.guild.members.fetch(user.id).catch(() => null);
			const errEmbed = new EmbedBuilder().setColor("#2B65EC");

			if (!member) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(`${user.username} is not in this server.`)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			const blocker = moderationBlocker(interaction, member, "kick");
			if (blocker) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(blocker)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			await member.kick(reason);

			const embed = new EmbedBuilder()
				.setDescription(`Successfully kicked ${member.displayName} with reason:\n${reason}\nUser ID: ${user.id}`)
				.setColor("#2B65EC")
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);

			const logs = findChannel(interaction.guild, process.env.logsChannel);
			if (logs) {
				await logs.send({ embeds: [embed] }).catch(() => { /* Catch */ });
			}
		} catch (error) {
			console.error("Error in kick command:", error);
			const errorMessage = "An error occurred while kicking the user. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
