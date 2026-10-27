const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { Connect4 } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("connect")
		.setDescription("Connect 4 Dots")
		.addUserOption(option =>
			option
				.setName("opponent")
				.setDescription("choose an opponent")
				.setRequired(true)),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const opponent = interaction.options.getUser("opponent");
			if (opponent.bot) {
				await interaction.reply({
					content: "Bot is not allowed",
				});
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
				return;
			}

			const Game = new Connect4({
				message: interaction,
				isSlashGame: true,
				opponent: opponent,
				embed: {
					title: "Connect4 Game",
					statusTitle: "Status",
					color: "#5865F2",
				},
				emojis: {
					board: "⚪",
					player1: "🔴",
					player2: "🟡",
				},
				mentionUser: true,
				timeoutTime: 60000,
				buttonStyle: "PRIMARY",
				turnMessage: "{emoji} | Its turn of player **{player}**.",
				winMessage: "{emoji} | **{player}** won the Connect4 Game.",
				tieMessage: "The Game tied! No one won the Game!",
				timeoutMessage: "The Game went unfinished! No one won the Game!",
				playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in connect command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
