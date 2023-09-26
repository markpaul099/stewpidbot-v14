const { SlashCommandBuilder } = require("discord.js");
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

		const cmd_ch = await interaction.guild.channels.cache.find(channel => channel.name === "bot-commands");
		if (cmd_ch.id !== interaction.channel.id) {
			interaction.reply(
				`use ${cmd_ch} for game commands`,
			);
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
			return;
		}

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

		Game.startGame();
	},
};
