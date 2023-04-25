const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMasterPlayer } = require("discord-player");

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
		const volume = interaction.options.getInteger("value");
		// Let the Discord Client know the bot is alive
		await interaction.deferReply();

		// Get the voice channel
		const channel = interaction.member.voice.channel;

		const player = useMasterPlayer();

		// Get the queue for the server
		const queue = player.nodes.get(interaction.guildId);
		// If there is no queue, return
		if (!queue) {
			await interaction.editReply("There are no songs playing");
			return;
		}

		// If the member is not in a voice channel, return
		if (!channel) {
			return interaction.editReply("You are not connected to a voice channel.");
		} else if (channel !== queue.channel) {
			return interaction.editReply("You are in a different channel");
		}

		// Skip the current song
		queue.node.setVolume(volume);

		await interaction.editReply(`Volume has been set to ${volume}%`);
	},
};