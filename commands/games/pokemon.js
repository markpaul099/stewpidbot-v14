const { SlashCommandBuilder } = require("discord.js");
const { GuessThePokemon } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pokemon")
		.setDescription("Guess the Pokemon"),
	async execute(interaction) {

		const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === "bot-commands");
		if (cmdChannel.id !== interaction.channel.id) {
			interaction.reply(
				`use ${cmdChannel} for game commands`,
			);
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
			return;
		}

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

		Game.startGame();
	},
};