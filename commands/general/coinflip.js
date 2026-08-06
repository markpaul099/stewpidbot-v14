const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const coin = ["Tails", "Heads"];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription("flip a coin!"),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			const result = coin[Math.floor(Math.random() * coin.length)];
			await interaction.editReply(`Result: ${result}`);
			setTimeout(() => interaction.deleteReply(), 60000);
		} catch (error) {
			console.error("Error in coinflip command:", error);
			const errorMessage = "An error occurred while flipping the coin. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
