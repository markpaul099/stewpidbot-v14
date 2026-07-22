const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("test-out")
		.setDescription("Simulate Leave")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.client.emit("guildMemberRemove", interaction.member);
		interaction.reply("Emited GuildMemberRemove");
	},
};
