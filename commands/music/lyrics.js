const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { lyricsExtractor } = require("@discord-player/extractor");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lyrics")
		.setDescription("Current song's lyrics."),
	async execute(interaction) {
		try {

			const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === process.env.commandChannel);
			if (cmdChannel.id !== interaction.channel.id) {
				await interaction.reply({
					content: `use ${cmdChannel} for music commands`,
					ephemeral: true,
				});
				return;
			}

			const player = useMainPlayer();
			const queue = player.nodes.get(interaction.guildId);

			if (!queue) {
				await interaction.reply({
					content: "There is nothing playing.",
					ephemeral: true,
				});
				return;
			}

			const usrChannel = interaction.member.voice.channel;
			const cliChannel = interaction.guild.members.me.voice.channel;

			// Check if user is in the same voice channel as the bot
			if (cliChannel !== usrChannel) {
				await interaction.reply({
					content: `You are not connected in ${cliChannel}`,
					ephemeral: true,
				});
				return;
			}

			const embed = new EmbedBuilder();

			const lyricsClient = lyricsExtractor(process.env.geniusApiToken);
			const result = await lyricsClient.search(queue.currentTrack.title)
				.then((x) => console.log(x))
				.catch(console.error);

			if (!result) {
				embed
					.setColor("#152739")
					.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
					.setDescription(`Couldn't find lyrics for ${queue.currentTrack.title}`)
					.setTimestamp();

				await interaction.reply({ embeds: [embed] });
				return;
			}

			const trimmedLyrics = result.lyrics.substring(0, 1997);

			embed
				.setColor("#152739")
				.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
				.setTitle(`${result.title}`)
				.setThumbnail(`${result.thumbnail}`)
				.setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics);
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command.",
				ephemeral: true,
			});
			return;
		}
	},
};