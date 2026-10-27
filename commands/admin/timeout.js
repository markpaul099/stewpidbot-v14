const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, TimestampStyles, time } = require("discord.js");
const { findChannel } = require("../../utils/channels.js");
const { moderationBlocker } = require("../../utils/permissions.js");

// Discord allows timeouts of up to 28 days
const MAX_MINUTES = 28 * 24 * 60;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("timeout")
		.setDescription("Time out a member so they can't chat or join voice")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("The member to time out")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("minutes")
				.setDescription("How long, in minutes (max 40320 = 28 days). 0 removes the timeout.")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(MAX_MINUTES))
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("The reason for the timeout")
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const user = interaction.options.getUser("user");
			const minutes = interaction.options.getInteger("minutes");
			const reason = interaction.options.getString("reason") || "No reason provided";
			const member = await interaction.guild.members.fetch(user.id).catch(() => null);

			const errEmbed = new EmbedBuilder().setColor("#152739");

			if (!member) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(`${user.username} is not in this server.`)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			const blocker = moderationBlocker(interaction, member, "time out");
			if (blocker) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(blocker)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			// Discord rejects timeouts on administrators
			if (member.permissions.has(PermissionFlagsBits.Administrator)) {
				await interaction.editReply({ embeds: [errEmbed.setDescription(`${member.displayName} is an administrator and can't be timed out.`)] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			const embed = new EmbedBuilder()
				.setColor("#152739")
				.setTimestamp();

			if (minutes === 0) {
				await member.timeout(null, reason);
				embed.setDescription(`Removed the timeout from ${member.displayName}.\nReason: ${reason}\nUser ID: ${user.id}`);
			} else {
				await member.timeout(minutes * 60 * 1000, reason);
				const until = new Date(Date.now() + minutes * 60 * 1000);
				embed.setDescription(`Timed out ${member.displayName} until ${time(until, TimestampStyles.LongDateTime)} with reason:\n${reason}\nUser ID: ${user.id}`);
			}

			await interaction.editReply({ embeds: [embed] }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);

			const logs = findChannel(interaction.guild, process.env.logsChannel);
			if (logs) {
				await logs.send({ embeds: [embed] }).catch(() => { /* Catch */ });
			}

		} catch (error) {
			console.error("Error in timeout command:", error);
			const errorMessage = "An error occurred while timing out the user. Please try again.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
