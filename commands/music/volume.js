const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription("Change music volume")
		.addIntegerOption(option =>
			option
				.setName("value")
				.setDescription("0 - 100")
				.setMinValue(0)
				.setMaxValue(100)
				.setRequired(true)),
	async execute(interaction) {
		try {
			const volume = interaction.options.getInteger("value");
			// Let the Discord Client know the bot is alive
			await interaction.deferReply();

			// Get the voice channel
			const channel = interaction.member.voice.channel;

			const player = useMainPlayer();

			// Get the queue for the server
			const queue = player.nodes.get(interaction.guildId);
			// If there is no queue, return
			if (!queue) {
				await interaction.editReply("There are no songs playing");
				return;
			}

			// If the member is not in a voice channel, return
			if (!channel) {
				return interaction.editReply({
					content: "You are not connected to a voice channel.",
					ephemeral: true,
				});
			}

			// Skip the current song
			queue.node.setVolume(volume);

			await interaction.editReply(`Volume has been set to ${volume}%`);
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};