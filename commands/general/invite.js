const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite link"),
	async execute(interaction) {
		const welcome = await interaction.guild.channels.cache.find(channel => channel.name === "welcome");
		const invLink = await welcome.createInvite();
		interaction.reply(`Invite link: ${invLink}`);
	},
};
