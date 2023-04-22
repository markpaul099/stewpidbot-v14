const { SlashCommandBuilder } = require("discord.js");
const { INV_LINK } = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite link"),
	async execute(interaction) {
		await interaction.reply({ content: INV_LINK });
	},
};
