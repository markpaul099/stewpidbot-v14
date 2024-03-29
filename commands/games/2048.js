const { SlashCommandBuilder } = require("discord.js");
const { TwoZeroFourEight } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("2048")
		.setDescription("Slide the Tiles"),
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

		Game.startGame();
	},
};
