const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { inCommandChannel } = require("../../utils/channels.js");
const { GuessThePokemon } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pokemon")
		.setDescription("Guess the Pokemon"),
	async execute(interaction) {
		try {
			if (!(await inCommandChannel(interaction))) return;

			const Game = new GuessThePokemon({
				message: interaction,
				isSlashGame: true,
				embed: {
					title: "Who's That Pokemon",
					color: "#5865F2",
				},
				timeoutTime: 60000,
				winMessage: "you guessed it right! It was a {pokemon}.",
				loseMessage: "better luck next time! it was a {pokemon}.",
				errMessage: "unable to fetch pokemon data! please try again.",
				playerOnlyMessage: "only {player} can use these buttons.",
			});

			await Game.startGame();
		} catch (error) {
			console.error("Error in pokemon command:", error);
			const errorMessage = "An error occurred while starting the game. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},
};
