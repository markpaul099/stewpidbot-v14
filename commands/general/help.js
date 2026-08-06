const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Available Commands"),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });

			const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === process.env.commandChannel);
			if (cmdChannel.id !== interaction.channel.id) {
				await interaction.editReply(
					`use ${cmdChannel} for help command`,
				);
				setTimeout(() => {
					interaction.deleteReply();
				}, 5000);
				return;
			}
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
				{ name: "Games", value: `Only work in ${cmdChannel}
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
				// { name: "Levels", value: `Only work in ${cmdChannel}
					// **/leaderboard** - Guild Ranking
					// **/level** - Check User Level\n
					// ` },
				)
				.setTimestamp()
				.setFooter({ text: `© ${interaction.client.user.username} Bot`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) });
			await interaction.editReply({ embeds: [embed] });
			setTimeout(() => interaction.deleteReply(), 60000);
		} catch (error) {
			console.error("Error in help command:", error);
			const errorMessage = "An error occurred while displaying help. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
