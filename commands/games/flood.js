const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { Flood } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("flood")
		.setDescription("A flood Game")
		.addNumberOption(option =>
			option
				.setName("dificulty")
				.setDescription("'Trivia's dificulty")
				.addChoices(
					{ name: "Easy = 8", value: 8 },
					{ name: "Medium = 13", value: 13 },
					{ name: "Hard = 18", value: 18 },
				)),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const dificulty = interaction.options.getNumber("dificulty") || 13;

			const Game = new Flood({
				message: interaction,
				isSlashGame: true,
				embed: {
					title: "Flood",
					color: "#5865F2",
				},
				difficulty: dificulty,
				timeoutTime: 60000,
				buttonStyle: "PRIMARY",
				emojis: ["🟥", "🟦", "🟧", "🟪", "🟩"],
				winMessage: "You won! You took **{turns}** turns.",
				loseMessage: "You lost! You took **{turns}** turns.",
				playerOnlyMessage: "Only {player} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in flood command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
