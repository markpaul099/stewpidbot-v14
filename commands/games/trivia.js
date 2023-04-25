const { SlashCommandBuilder } = require("discord.js");
const { Trivia } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("trivia")
		.setDescription("Guess the Answer")
		.addStringOption(option =>
			option
				.setName("dificulty")
				.setDescription("'Trivia's dificulty")
				.addChoices(
					{ name: "Easy", value: "easy" },
					{ name: "Medium", value: "medium" },
					{ name: "Hard", value: "hard" },
				)),
	async execute(interaction) {
		const dificulty = interaction.options.getString("dificulty") || "medium";

		const Game = new Trivia({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: "Trivia",
				color: "#2F3136",
				description: "you have 60 seconds to guess the answer.",
			},
			timeoutTime: 60000,
			buttonStyle: "PRIMARY",
			trueButtonStyle: "SUCCESS",
			falseButtonStyle: "DANGER",
			mode: "multiple", // multiple || single
			difficulty: dificulty, // easy || medium || hard
			winMessage: "you won! the correct answer is {answer}.",
			loseMessage: "you lost! the correct answer is {answer}.",
			errMessage: "unable to fetch question data! Please try again.",
			playerOnlyMessage: "only {player} can use these buttons.",
		});

		Game.startGame();
	},
};