const { SlashCommandBuilder } = require("discord.js");
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
			const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === process.env.commandChannel);
			if (cmdChannel.id !== interaction.channel.id) {
				await interaction.reply(
					`use ${cmdChannel} for game commands`,
				);
				setTimeout(() => {
					interaction.deleteReply();
				}, 5000);
				return;
			}

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

			Game.startGame();
		} catch (error) {
			console.error("Error in ttt command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, ephemeral: true });
			} else {
				await interaction.reply({ content: errorMessage, ephemeral: true });
			}
		}
	},
};