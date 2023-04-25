const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { COMMAND_CH } = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Available Commands"),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor("#2B65EC")
			.setTitle("Commands")
			.setAuthor({ name: `${interaction.member.displayName} used /help`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
			.addFields({ name: "General", value: `**/help** - Commands
**/coinflip** - Flip a Coin!
**/invite** - Invite link
**/ping** - Bot's Ping
**/server** - See server stats
**/uptime** - Bot's uptime\n
` },
			{ name: "Games", value: `Only work in <#${COMMAND_CH}>
**/2048** - Slide the Tiles
**/connect** - Connect 4 Dots
**/findfruit** - Find Fruit
**/flood** - A Flood Game
**/matchfruit** - Match the Fruits
**/mine** - Minesweeper!!!
**/pokemon** - Guess the Pokemon
**/rps** - Rock Paper Scissors
**/ttt** - Tic Tac Toe!
**/trivia** - Guess the Answer\n
` },
			{ name: "Levels", value: `Only work in <#${COMMAND_CH}>
**/leaderboard** - Guild Ranking
**/level** - Check User Level\n
` },
			{ name: "Music", value: `Only work in <#${COMMAND_CH}>
**/clearqueue** - Clear all the music in the queue
**/current** - Shows the song currently playing
**/exit** - Kick the bot from the voice channel
**/loop** - Enable or disable looping of songs or the whole queue
**/lyrics** - Current song lyrics
**/pause** - Pauses the current song
**/play** - Play a song from YouTube, Spotify or Soundcloud
**/previous** - Replays previous song
**/queue** - Shows first 10 songs in the queue
**/resume** - Resumes the current song
**/shuffle** - Shuffles the playlist
**/skip** - Skips the current song
**/skipto** - Skips to a specific song in the queue
**/volume** - Change music volume` })
			.setTimestamp()
			.setFooter({ text: `© ${interaction.client.user.username} Bot`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) });
		await interaction.reply({ embeds: [embed] });
		setTimeout(() => interaction.deleteReply(), 60000);
	},
};
