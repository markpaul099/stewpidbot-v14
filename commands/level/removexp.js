const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Levels = require("@markpaul099/discord-xp");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("removexp")
		.setDescription("Remove a specified amount of XP from a user")
		.addUserOption(option =>
			option
				.setName("member")
				.setDescription("Choose a Member")
				.setRequired(true))
		.addNumberOption(option =>
			option
				.setName("amount")
				.setDescription("Amount of XP to subtract")
				.setRequired(true)
				.setMinValue(1))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const amount = interaction.options.getNumber("amount");
		const member = interaction.options.getMember("member");

		const user = await Levels.fetch(member.id, interaction.guild.id, true);

		if (amount > (user.xp)) {
			return interaction.reply("Amount is greater than user's XP.");
		}

		await Levels.subtractXp(member.id, interaction.guild.id, amount);
		await interaction.reply(`${amount} XP was removed from ${member.displayName}.`);
	},
};