const { SlashCommandBuilder } = require("discord.js");
const { Minesweeper } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mine")
		.setDescription("Minesweeper!!!")
		.addNumberOption(option =>
			option
				.setName("dificulty")
				.setDescription("'Number of mines")
				.addChoices(
					{ name: "Easy = 3", value: 3 },
					{ name: "Medium = 5", value: 5 },
					{ name: "Hard = 8", value: 8 },
				)),
	async execute(interaction) {

		const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === process.env.commandChannel);
		if (cmdChannel.id !== interaction.channel.id) {
			interaction.reply(
				`use ${cmdChannel} for game commands`,
			);
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
			return;
		}

		const dificulty = interaction.options.getNumber("dificulty") || 5;

		const Game = new Minesweeper({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: "Minesweeper",
				color: "#5865F2",
				description: "Click on the buttons to reveal the blocks except mines.",
			},
			emojis: { flag: "🚩", mine: "💣" },
			mines: dificulty,
			timeoutTime: 60000,
			winMessage: "You won the Game! You successfully avoided all the mines.",
			loseMessage: "You lost the Game! Be aware of the mines next time.",
			playerOnlyMessage: "Only {player} can use these buttons.",
		});

		Game.startGame();
	},
};
