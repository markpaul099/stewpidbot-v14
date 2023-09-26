const { SlashCommandBuilder } = require("discord.js");
const { MatchPairs } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("matchfruit")
		.setDescription("Match the Fruits"),
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

		Game.startGame();
	},
};