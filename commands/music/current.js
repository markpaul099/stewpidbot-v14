const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMasterPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("current")
		.setDescription("The song currently playing."),
	async execute(interaction) {

		const player = useMasterPlayer();
		const queue = player.nodes.get(interaction.guildId);
		const embed = new EmbedBuilder();

		if (!queue) {
			return interaction.reply("There are no songs in the queue.");
		}

		const progress = queue.node.createProgressBar();

		embed
			.setTitle("Playing")
			.setColor("#152739")
			.setDescription(
				`**[${queue.currentTrack.title}](${
					queue.currentTrack.url
				}) • ${`${queue.currentTrack.duration}`}**\n\n${progress.replace(
					/ 0:00/g,
					"LIVE",
				)}`,
			)
			.setThumbnail(`${queue.currentTrack.thumbnail}`);

		await interaction.reply({ embeds: [embed] });

	},
};