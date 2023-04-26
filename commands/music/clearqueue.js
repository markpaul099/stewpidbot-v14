const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clearqueue")
		.setDescription("Clear all the music in the queue"),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const channel = interaction.member.voice.channel;


			const queue = useQueue(interaction.guild.id);

			if (!queue || !queue.node.isPlaying()) {
				return interaction.editReply({
					content: "There is no music currently playing.",
					ephemeral: true,
				});
			}

			if (queue.size < 1) {
				return interaction.editReply({
					content: "There is no music in the queue after the current one.",
					ephemeral: true,
				});
			}

			if (!channel) {
				return interaction.editReply({
					content: "You are not connected to a voice channel.",
					ephemeral: true,
				});
			} 	else if (channel !== queue.channel) {
				return interaction.editReply({
					content: "You are in a different voice channel.",
					ephemeral: true,
				});
			}

			queue.clear();

			await interaction.editReply("The queue has just been cleared.");
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};