const { SlashCommandBuilder, MessageFlags } = require("discord.js");

const coin = ["Tails", "Heads"];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription("Flip a coin!"),

	async execute(interaction) {
		try {
			await interaction.deferReply();
			const result = coin[Math.floor(Math.random() * coin.length)];
			await interaction.editReply({ content: `🪙 Result: **${result}**` }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 60000);
		} catch (error) {
			console.error("Error in coinflip command:", error);
			const errorMessage = "An error occurred while flipping the coin. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.deleteReply().catch(() => { /* Catch */ });
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};