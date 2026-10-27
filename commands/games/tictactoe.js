const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { TicTacToe } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ttt")
		.setDescription("Tic Tac Toe!")
		.addUserOption(option =>
			option
				.setName("opponent")
				.setDescription("Choose an Opponent")
				.setRequired(true)),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const opponent = interaction.options.getUser("opponent");
			if (opponent.bot) {
				await interaction.reply({
					content: "Bot is not allowed",
				});
				setTimeout(() => interaction.deleteReply(), 5000);
				return;
			}

			const Game = new TicTacToe({
				message: interaction,
				isSlashGame: true,
				opponent: opponent,
				embed: {
					title: "Tic Tac Toe",
					color: "#2F3136",
					statusTitle: "Status",
					overTitle: "Game Over",
				},
				emojis: {
					xButton: "✖️",
					oButton: "⭕",
					blankButton: "➖",
				},
				mentionUser: true,
				timeoutTime: 60000,
				xButtonStyle: "DANGER",
				oButtonStyle: "PRIMARY",
				turnMessage: "{emoji} | its turn of player **{player}**.",
				winMessage: "{emoji} | **{player}** won the TicTacToe Game.",
				tieMessage: "the game tied! no one won the game!",
				timeoutMessage: "the game went unfinished! no one won the game!",
				playerOnlyMessage: "only {player} and {opponent} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in ttt command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
