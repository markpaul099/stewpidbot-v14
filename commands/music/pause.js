const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pauses the current song"),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const player = useMainPlayer();
			// Get the queue for the server
			const queue = player.nodes.get(interaction.guildId);

			const channel = interaction.member.voice.channel;

			// Check if the queue is empty
			if (!queue) {
				return await interaction.editReply("There are no songs in the queue.");
			}

			// Check if the player is already paused
			if (queue.node.isPaused()) {
				await interaction.editReply("Player is already paused.");
				return;
			}

			// If the member is not in a voice channel, return
			if (!channel) {
				return interaction.editReply({
					content: "You are not connected to a voice channel.",
					ephemeral: true,
				});
			}

			// Pause the current song
			queue.node.pause();

			await interaction.editReply("Player has been paused.");
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};