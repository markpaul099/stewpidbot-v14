const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

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
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const user = interaction.options.getUser("user");
		const reason = interaction.options.getString("reason") || "No reason provided";

		const member = await interaction.guild.members.fetch(user.id);
		console.log(member);

		const errEmbed = new EmbedBuilder()
			.setDescription(`You can't take action on ${member.displayName} since they have a higher role.`)
			.setColor("#2B65EC");

		if (member.roles.highest.position >= interaction.member.roles.highest.position) {
			return interaction.reply({ embeds: [errEmbed] });
		}

		await member.kick(reason);

		const embed = new EmbedBuilder()
			.setDescription(`Succesfully banned ${member.displayName} with reason:\n ${reason}`)
			.setColor("#2B65EC")
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};