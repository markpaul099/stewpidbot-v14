const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restart Bot")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		// Shutdown bot and let PM2 restart the bot
		interaction.reply("Restarting...");
		setTimeout(() =>
			interaction.editReply("Bot Restarted"), 3000);

		setTimeout(() => {
			interaction.client.destroy();
			process.exit(0);
		}, 4000);
	},
};
