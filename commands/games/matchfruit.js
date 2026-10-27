const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { MatchPairs } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("matchfruit")
		.setDescription("Match the Fruits"),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const Game = new MatchPairs({
				message: interaction,
				isSlashGame: true,
				embed: {
					title: "Match Fruits",
					color: "#2F3136",
					description: "**click on the buttons to match fruits with their pairs.**",
				},
				timeoutTime: 60000,
				emojis: ["🍉", "🍇", "🍊", "🥭", "🍎", "🍏", "🥝", "🥥", "🍓", "🫐", "🍍", "🥕", "🥔"],
				winMessage: "**you won the game! you turned a total of `{tilesTurned}` tiles.**",
				loseMessage: "**you lost the game! you turned a total of `{tilesTurned}` tiles.**",
				playerOnlyMessage: "only {player} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in matchfruit command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
