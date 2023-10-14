const { SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite link"),
	async execute(interaction) {
		const welcome = await interaction.guild.channels.cache.find(channel => channel.name === process.env.welcomeChannel);
		const invLink = await welcome.createInvite();
		interaction.reply(`Invite link: ${invLink}`);
	},
};
