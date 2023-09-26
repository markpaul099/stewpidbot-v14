const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { lyricsExtractor } = require("@discord-player/extractor");
const { GeniusApiToken } = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lyrics")
		.setDescription("Current song's lyrics."),
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

			const lyrics = lyricsExtractor(GeniusApiToken);
			const player = useMainPlayer();
			const queue = player.nodes.get(interaction.guildId);

			if (!queue) {
				return interaction.editReply("There is nothing playing.");
			}

			const embed = new EmbedBuilder();


			const result = await lyrics.search(queue.currentTrack.title);

			if (!result) {
				embed
					.setColor("#152739")
					.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
					.setDescription(`Couldn't find lyrics for ${queue.currentTrack.title}`)
					.setTimestamp();

				return await interaction.editReply({ embeds: [embed] });
			}

			const trimmedLyrics = result.lyrics.substring(0, 1997);

			embed
				.setColor("#152739")
				.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
				.setTitle(`${result.title}`)
				.setThumbnail(`${result.thumbnail}`)
				.setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics);
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};