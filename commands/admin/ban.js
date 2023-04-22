const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

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
		const user = interaction.options.getUser("user");
		const reason = interaction.options.getString("reason") || "No reason provided";

		const member = await interaction.guild.members.fetch(user.id);
		console.log(member);

		const errEmbed = new EmbedBuilder()
			.setDescription(`You can't take action on ${member.displayName} since they have a higher or similar role.`)
			.setColor("#2B65EC");

		if (member.roles.highest.position >= interaction.member.roles.highest.position) {
			return interaction.reply({ embeds: [errEmbed] });
		}

		await member.ban(reason);

		const embed = new EmbedBuilder()
			.setDescription(`Succesfully banned ${member.displayName} with reason:\n ${reason}\nUser ID: ${member.id}`)
			.setColor("#2B65EC")
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};