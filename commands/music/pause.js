const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMasterPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pauses the current song"),
	async execute(interaction) {
		// Let the Discord Client know the bot is alive
		await interaction.deferReply();
		const player = useMasterPlayer();
		// Get the queue for the server
		const queue = player.nodes.get(interaction.guildId);

		const channel = interaction.member.voice.channel;

		// Check if the queue is empty
		if (!queue) {
			await interaction.editReply("There are no songs in the queue.");
			return;
		}

		// If the member is not in a voice channel, return
		if (!channel) {
			return interaction.editReply("You are not connected to a voice channel.");
		} else if (channel !== queue.channel) {
			return interaction.editReply("You are in a different channel");
		}

		// Check if the player is already paused
		if (queue.node.isPaused()) {
			await interaction.editReply("Player is already paused.");
			return;
		}

		// Pause the current song
		queue.node.pause();

		await interaction.editReply("Player has been paused.");
	},
};