const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clearqueue")
		.setDescription("Clear all the music in the queue"),
	async execute(interaction) {
		await interaction.deferReply();
		try {

			const cmd_ch = await interaction.guild.channels.cache.find(channel => channel.name === "bot-commands");
			if (cmd_ch.id !== interaction.channel.id) {
				interaction.editReply(
					`use ${cmd_ch} for music commands`,
				);
				setTimeout(() => {
					interaction.deleteReply();
				}, 5000);
				return;
			}

			const channel = interaction.member.voice.channel;


			const queue = useQueue(interaction.guild.id);

			if (!queue || !queue.node.isPlaying()) {
				return interaction.editReply(
					"There is no music currently playing.");
			}

			if (queue.size < 1) {
				return interaction.editReply(
					"There is no music in the queue after the current one.",
				);
			}

			if (!channel) {
				return interaction.editReply(
					"You are not connected to a voice channel.",
				);
			}

			queue.clear();

			await interaction.editReply(
				"The queue has just been cleared.",
			);
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: "There was an error while executing this command.",
			});
		}
	},
};