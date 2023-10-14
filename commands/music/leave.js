const { useMainPlayer } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Kick the bot from the channel"),
	async execute(interaction) {
		try {

			const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === process.env.commandChannel);
			if (cmdChannel.id !== interaction.channel.id) {
				await interaction.reply({
					content: `use ${cmdChannel} for music commands`,
					ephemeral: true,
				});
				return;
			}

			const player = useMainPlayer();

			// Get the current queue
			const queue = player.nodes.get(interaction.guildId);

			// Return if queue is empty
			if (!queue) {
				await interaction.reply({
					content: "There are no songs in the queue.",
					ephemeral: true,
				});
				return;
			}

			const usr_channel = interaction.member.voice.channel;
			const cli_channel = interaction.guild.members.me.voice.channel;

			// Check if user is in the same voice channel as the bot
			if (cli_channel !== usr_channel) {
				await interaction.reply({
					content: `You are not connected in ${cli_channel}`,
					ephemeral: true,
				});
				return;
			}

			// Deletes all the songs from the queue and exits the channel
			queue.delete();

			await interaction.reply("I didn't want to be here anyway, B-baka . . ! ૮₍ ˃ ⤙ ˂ ₎ა");

		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command.",
				ephemeral: true,
			});
			return;
		}
	},
};