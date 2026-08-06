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
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			const user = interaction.options.getUser("user");
			const reasons = interaction.options.getString("reason") || "No reason provided";

			const member = await interaction.guild.members.fetch(user.id);

			const logs = member.guild.channels.cache.find(c => c.name === process.env.logsChannel);

			const errEmbed = new EmbedBuilder()
				.setDescription(`You can't take action on ${member.displayName} since they have a higher or similar role.`)
				.setColor("#152739");

			if (member.roles.highest.position >= interaction.member.roles.highest.position) {
				await interaction.editReply({ embeds: [errEmbed] });
				setTimeout(() => interaction.deleteReply(), 10000);
				return;
			}

			await member.ban({ reason: `${reasons}` });

			const embed = new EmbedBuilder()
				.setDescription(`Succesfully banned ${member.displayName} with reason:\n ${reasons}\nUser ID: ${member.id}`)
				.setColor("#152739")
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
			setTimeout(async () => {
				await interaction.deleteReply();
			}, 10000);
			await logs.send({ embeds: [embed] });
		} catch (error) {
			console.error("Error in ban command:", error);
			const errorMessage = "An error occurred while banning the user. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};