const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Levels = require("@markpaul099/discord-xp");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("addxp")
		.setDescription("Add a specified amount of XP on a user")
		.addUserOption(option =>
			option
				.setName("member")
				.setDescription("Choose a Member")
				.setRequired(true))
		.addNumberOption(option =>
			option
				.setName("amount")
				.setDescription("Amount of XP to add")
				.setRequired(true)
				.setMinValue(1))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const amount = interaction.options.getNumber("amount");
		const member = interaction.options.getMember("member");

		await Levels.appendXp(member.id, interaction.guild.id, amount);
		await interaction.reply(`${amount} XP was added to ${member.displayName}`);
	},
};