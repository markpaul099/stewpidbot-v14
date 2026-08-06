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

			Game.startGame();
		} catch (error) {
			console.error("Error in rps command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, ephemeral: true });
			} else {
				await interaction.reply({ content: errorMessage, ephemeral: true });
			}
		}
	},
};