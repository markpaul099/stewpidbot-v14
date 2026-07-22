const { SlashCommandBuilder } = require("discord.js");
const coin = ["Tails", "Heads"];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription("flip a coin!"),
	async execute(interaction) {
		const result = coin[Math.floor(Math.random() * coin.length)];
		await interaction.reply(`Result: ${result}`);
	},
};
