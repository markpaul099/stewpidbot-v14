const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { TwoZeroFourEight } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("2048")
		.setDescription("Slide the Tiles"),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const Game = new TwoZeroFourEight({
				message: interaction,
				isSlashGame: true,
				embed: {
					title: "2048",
					color: "#5865F2",
				},
				emojis: {
					up: "⬆️",
					down: "⬇️",
					left: "⬅️",
					right: "➡️",
				},
				timeoutTime: 60000,
				buttonStyle: "PRIMARY",
				playerOnlyMessage: "Only {player} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in 2048 command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
