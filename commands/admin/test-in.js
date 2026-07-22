const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("test-in")
		.setDescription("Simulate Join")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.client.emit("guildMemberAdd", interaction.member);
		await interaction.reply("Emitted GuildMemberAdd");
	},
};
