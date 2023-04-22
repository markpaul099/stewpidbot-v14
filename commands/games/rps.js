const { SlashCommandBuilder } = require("discord.js");
const { RockPaperScissors } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("rps")
		.setDescription("Rock Paper Scissors")
		.addUserOption(option =>
			option
				.setName("opponent")
				.setDescription("Choose an Opponent")
				.setRequired(true)),
	async execute(interaction) {
		const Game = new RockPaperScissors({
			message: interaction,
			isSlashGame: true,
			opponent: interaction.options.getUser("opponent"),
			embed: {
				title: "Rock Paper Scissors",
				color: "#2F3136",
				description: "press a button to make a move.",
			},
			buttons: {
				rock: "rock",
				paper: "paper",
				scissors: "scissors",
			},
			emojis: {
				rock: "🪨",
				paper: "🧻",
				scissors: "✂️",
			},
			mentionUser: true,
			timeoutTime: 60000,
			buttonStyle: "PRIMARY",
			pickMessage: "you chose {emoji}.",
			winMessage: "**{player}** won the game! congratulations!",
			tieMessage: "the game tied! no one won the game!",
			timeoutMessage: "the game went unfinished! no one won the Game!",
			playerOnlyMessage: "only {player} and {opponent} can use these buttons.",
		});

		Game.startGame();
	},
};