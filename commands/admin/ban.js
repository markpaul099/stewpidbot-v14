const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban a user from the server")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("The user to ban")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("The reason for the ban")
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const user = interaction.options.getUser("user");
			const reason = interaction.options.getString("reason") || "No reason provided";
			const member = await interaction.guild.members.fetch(user.id).catch(() => null);

			if (member) {
				if (member.roles.highest.position >= interaction.member.roles.highest.position) {
					const errEmbed = new EmbedBuilder()
						.setDescription(`You can't take action on ${user.username} since they have a higher or equal role to yours.`)
						.setColor("#152739");

					await interaction.editReply({ embeds: [errEmbed] }).catch(() => { /* Catch */ });
					setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
					return;
				}

				if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
					const errEmbed = new EmbedBuilder()
						.setDescription(`I can't ban ${user.username} because their highest role is above or equal to mine.`)
						.setColor("#152739");

					await interaction.editReply({ embeds: [errEmbed] }).catch(() => { /* Catch */ });
					setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
					return;
				}
			}

			await interaction.guild.members.ban(user.id, { reason: reason });

			const embed = new EmbedBuilder()
				.setDescription(`Successfully banned ${user.username} with reason:\n${reason}\nUser ID: ${user.id}`)
				.setColor("#152739")
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);

			if (process.env.logsChannel) {
				const logs = interaction.guild.channels.cache.find(c => c.name === process.env.logsChannel);
				if (logs) {
					await logs.send({ embeds: [embed] }).catch(() => { /* Catch */ });
				}
			}

		} catch (error) {
			console.error("Error in ban command:", error);
			const errorMessage = "An error occurred while banning the user. Please try again.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};