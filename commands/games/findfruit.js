const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { FindEmoji } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("findfruit")
		.setDescription("Find Fruit"),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const Game = new FindEmoji({
				message: interaction,
				isSlashGame: true,
				embed: {
					title: "Find Fruit",
					color: "#5865F2",
					description: "Remember the fruits from the board below.",
					findDescription: "Find the {emoji} fruit before the time runs out.",
				},
				timeoutTime: 60000,
				hideEmojiTime: 5000,
				buttonStyle: "PRIMARY",
				emojis: ["🍉", "🍇", "🍊", "🍋", "🥭", "🍎", "🍏", "🥝"],
				winMessage: "You won! You selected the correct fruit. {emoji}",
				loseMessage: "You lost! You selected the wrong fruit. {emoji}",
				timeoutMessage: "You lost! You ran out of time. The fruit is {emoji}",
				playerOnlyMessage: "Only {player} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in findfruit command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
