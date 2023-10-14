const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clearqueue")
		.setDescription("Clear all the music in the queue"),
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

			const queue = useQueue(interaction.guild.id);

			// Return if queue is empty
			if (!queue) {
				await interaction.reply({
					content: "There are no songs in the queue.",
					ephemeral: true,
				});
				return;
			}

			if (queue.size < 1) {
				await interaction.reply({
					content: "There is no music in the queue after the current one.",
					ephemeral: true,
				});
				return;
			}

			const usrChannel = interaction.member.voice.channel;
			const cliChannel = interaction.guild.members.me.voice.channel;

			// Check if user is in the same voice channel as the bot
			if (cliChannel !== usrChannel) {
				await interaction.reply({
					content: `You are not connected in ${cliChannel}`,
					ephemeral: true,
				});
				return;
			}

			queue.clear();

			await interaction.reply("The queue has just been cleared.");

		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command.",
				ephemeral: true,
			});
		}
	},
};