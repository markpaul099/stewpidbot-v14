const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Bot's Ping"),
	async execute(interaction) {
		await interaction.reply("Bot Ping = " + `\`${interaction.client.ws.ping} ms\``).catch(console.error);
		setTimeout(() => interaction.deleteReply(), 60000);
	},
};
