const { SlashCommandBuilder } = require("discord.js");
const { Connect4 } = require("discord-gamecord");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("connect")
		.setDescription("Connect 4 Dots")
		.addUserOption(option =>
			option
				.setName("opponent")
				.setDescription("choose an opponent")
				.setRequired(true)),
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

		const opponent = interaction.options.getUser("opponent");
		if (opponent.bot) {
			interaction.reply({
				content: "Bot is not allowed",
			});
			return;
		}

		const Game = new Connect4({
			message: interaction,
			isSlashGame: true,
			opponent: opponent,
			embed: {
				title: "Connect4 Game",
				statusTitle: "Status",
				color: "#5865F2",
			},
			emojis: {
				board: "⚪",
				player1: "🔴",
				player2: "🟡",
			},
			mentionUser: true,
			timeoutTime: 60000,
			buttonStyle: "PRIMARY",
			turnMessage: "{emoji} | Its turn of player **{player}**.",
			winMessage: "{emoji} | **{player}** won the Connect4 Game.",
			tieMessage: "The Game tied! No one won the Game!",
			timeoutMessage: "The Game went unfinished! No one won the Game!",
			playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
		});

		Game.startGame();
	},
};
