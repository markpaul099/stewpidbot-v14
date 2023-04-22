const { SlashCommandBuilder } = require("discord.js");
const { Flood } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("flood")
		.setDescription("A flood Game")
		.addStringOption(option =>
			option
				.setName("dificulty")
				.setDescription("'Trivia's dificulty")
				.addChoices(
					{ name: "Easy", value: "8" },
					{ name: "Medium", value: "13" },
					{ name: "Hard", value: "18" },
				)),
	async execute(interaction) {
		const dificulty = interaction.options.getString("dificulty") || "13";

		const Game = new Flood({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: "Flood",
				color: "#5865F2",
			},
			difficulty: dificulty,
			timeoutTime: 60000,
			buttonStyle: "PRIMARY",
			emojis: ["🟥", "🟦", "🟧", "🟪", "🟩"],
			winMessage: "You won! You took **{turns}** turns.",
			loseMessage: "You lost! You took **{turns}** turns.",
			playerOnlyMessage: "Only {player} can use these buttons.",
		});

		Game.startGame();
	},
};
