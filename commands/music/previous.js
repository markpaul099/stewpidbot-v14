const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMasterPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("previous")
		.setDescription("Replays previous song"),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const player = useMasterPlayer;
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

			// Check if there is a previously played song and go back to it
			if (queue.history.previousTrack) {
				queue.history.back();

				await interaction.editReply("Playing the previous song.");
			} else {
				await interaction.editReply("No previous song.");
			}
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};