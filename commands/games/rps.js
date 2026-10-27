const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
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

			const Game = new RockPaperScissors({
				message: interaction,
				isSlashGame: true,
				opponent: opponent,
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

			await Game.startGame();
		} catch (error) {
			console.error("Error in rps command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
