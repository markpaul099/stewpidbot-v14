const { SlashCommandBuilder, EmbedBuilder, MessageFlags, TimestampStyles, time } = require("discord.js");

// Embed field values are limited to 1024 characters
const MAX_ROLES_LENGTH = 1024;

function formatRoles(member) {
	const roles = member.roles.cache
		.filter(role => role.id !== member.guild.id) // Skip @everyone
		.sort((a, b) => b.position - a.position)
		.map(role => `${role}`);
	if (roles.length === 0) return "None";

	let text = "";
	for (const [index, role] of roles.entries()) {
		const more = ` and ${roles.length - index} more`;
		if (text.length + role.length + 1 + more.length > MAX_ROLES_LENGTH) return `${text}${more}`;
		text += (text ? " " : "") + role;
	}
	return text;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("userinfo")
		.setDescription("Show information about a user")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("The user to look up (defaults to you)")
				.setRequired(false)),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const user = await (interaction.options.getUser("user") ?? interaction.user).fetch();
			const member = await interaction.guild.members.fetch(user.id).catch(() => null);

			const embed = new EmbedBuilder()
				.setColor(member?.displayHexColor && member.displayHexColor !== "#000000" ? member.displayHexColor : "#2B65EC")
				.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 256, extension: "png" }) })
				.setThumbnail(user.displayAvatarURL({ size: 1024 }))
				.addFields(
					{ name: "User", value: `${user}${user.bot ? " (bot)" : ""}\nID: ${user.id}`, inline: true },
					{ name: "Account created", value: `${time(user.createdAt, TimestampStyles.LongDate)}\n${time(user.createdAt, TimestampStyles.RelativeTime)}`, inline: true },
				)
				.setTimestamp();

			if (member) {
				embed.addFields(
					{ name: "Joined server", value: `${time(member.joinedAt, TimestampStyles.LongDate)}\n${time(member.joinedAt, TimestampStyles.RelativeTime)}`, inline: true },
					{ name: "Nickname", value: member.nickname ?? "None", inline: true },
					{ name: "Roles", value: formatRoles(member) },
				);
				if (member.isCommunicationDisabled()) {
					embed.addFields({ name: "Timed out until", value: time(member.communicationDisabledUntil, TimestampStyles.LongDateTime) });
				}
			} else {
				embed.setFooter({ text: "Not a member of this server" });
			}

			await interaction.editReply({ embeds: [embed] });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 60000);
		} catch (error) {
			console.error("Error in userinfo command:", error);
			const errorMessage = "An error occurred while fetching user information. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},

	// Exposed for tests
	formatRoles,
};
