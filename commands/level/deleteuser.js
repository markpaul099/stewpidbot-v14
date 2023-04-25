const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Levels = require("@markpaul099/discord-xp");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("deleteuser")
		.setDescription("If the entry exists, it deletes it from database")
		.addUserOption(option =>
			option
				.setName("member")
				.setDescription("Choose a Member")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const member = interaction.options.getMember("member");

		const user = await Levels.fetch(member.id, interaction.guild.id, true);

		if (!user) {
			return interaction.reply(`${member.displayName} does not exist on the database.`);
		}

		await Levels.deleteUser(member.id, interaction.guild.id);
		await interaction.reply(`${member.displayName} was deleted from the database.`);
	},
};