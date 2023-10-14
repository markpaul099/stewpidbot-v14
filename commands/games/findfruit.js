const { SlashCommandBuilder } = require("discord.js");
const { FindEmoji } = require("discord-gamecord");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("findfruit")
		.setDescription("Find Fruit"),
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

		Game.startGame();
	},
};
