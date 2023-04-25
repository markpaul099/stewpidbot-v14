const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMasterPlayer } = require("discord-player");
const { lyricsExtractor } = require("@discord-player/extractor");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lyrics")
		.setDescription("Current song's lyrics."),
	async execute(interaction) {
		await interaction.deferReply("Looking for the lyrics...");

		const search = lyricsExtractor();
		const player = useMasterPlayer();
		const queue = player.nodes.get(interaction.guildId);

		if (!queue) {
			return interaction.editReply("There is nothing playing.");
		}

		const embed = new EmbedBuilder();

		if (queue) {
			const result = await search.search(queue.currentTrack.title);

			if (!result) {
				return interaction.editReply({
					embeds: [
						embed
							.setDescription(
								`Couldn't find lyrics for ${
									queue.currentTrack.title
								}`,
							)
							.setColor("#152739")
							.setTimestamp(),
					],
				});
			}

			const trimmedLyrics = result.lyrics.substring(0, 1997);

			embed
				.setTitle(`${result.title}`)
				.setThumbnail(`${result.thumbnail}`)
				.setColor("#152739")
				.setDescription(
					trimmedLyrics.length === 1997
						? `${trimmedLyrics}...`
						: trimmedLyrics,
				);
			await interaction.editReply({ embeds: [embed] });
		}
	},
};