const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Checks the bot's connection and latency."),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const ping = await interaction.client.ws.ping;
			await interaction.editReply({ content: "Bot Ping = " + `\`${ping} ms\`` });

			setTimeout(() => interaction.deleteReply(), 60000);
		} catch (error) {
			console.error(error);
			if (!interaction.deferred && !interaction.replied) {
				await interaction.editReply({ content: "There was an error while executing this command!" });
			}
		}
	},
};