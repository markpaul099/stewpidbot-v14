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
		const reasons = interaction.options.getString("reason") || "No reason provided";

		const member = await interaction.guild.members.fetch(user.id);

		const logs = await member.guild.channels.cache.find(channel => channel.name === "logs");

		const errEmbed = new EmbedBuilder()
			.setDescription(`You can't take action on ${member.displayName} since they have a higher or similar role.`)
			.setColor("#152739");

		if (member.roles.highest.position >= interaction.member.roles.highest.position) {
			await interaction.reply({ embeds: [errEmbed] });
			return;
		}

		await member.ban({ reason: `${reasons}` });


		const embed = new EmbedBuilder()
			.setDescription(`Succesfully banned ${member.displayName} with reason:\n ${reasons}\nUser ID: ${member.id}`)
			.setColor("#152739")
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
		setTimeout(async () => {
			await interaction.deleteReply();
		}, 10000);
		await logs.send({ embeds: [embed] });
	},
};