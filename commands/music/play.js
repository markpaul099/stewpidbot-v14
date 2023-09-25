const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QueryType, useMainPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song from YouTube.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("Searches for a song on YouTube and plays it")
				.addStringOption(option =>
					option.setName("searchterms")
						.setDescription("search keywords")
						.setRequired(true),
				))
		.addSubcommand(subcommand =>
			subcommand
				.setName("playlist")
				.setDescription("Plays a playlist from YouTube or Spotify")
				.addStringOption(option =>
					option
						.setName("url")
						.setDescription("the playlist's url")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("song")
				.setDescription("Plays a single song from YouTube, Spotify or Soundcloud")
				.addStringOption(option =>
					option
						.setName("url")
						.setDescription("the song's url")
						.setRequired(true))),
	async execute(interaction) {
		await interaction.deferReply();

		// Make sure the user is inside a voice channel
		const channel = interaction.member.voice.channel;
		// If the member is not in a voice channel, return
		if (!channel) {
			return interaction.editReply({
				content: "You are not connected to a voice channel.",
				ephemeral: true,
			});
		}

		const player = useMainPlayer();
		// Create a play queue for the server
		// const queue = await player.createQueue(interaction.guild);
		const queue = player.nodes.create(interaction.guild, {
			metadata: interaction,
			selfDeaf: true,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 600000, // Bot leaves Voice Channel after ten minutes if Voice Channel is empty
			leaveOnEnd: false,
		});

		// Wait until you are connected to the channel
		if (interaction.client.voice.adapters.size == 0) {
			await queue.connect(interaction.member.voice.channel);
		}


		const embed = new EmbedBuilder();

		if (interaction.options.getSubcommand() === "song") {
			const url = interaction.options.getString("url");
			let result;
			// Search for the song using the discord-player
			if (url.includes("youtube") || url.includes("youtu.be")) {
				result = await player.search(url, {
					requestedBy: interaction.user,
					searchEngine: QueryType.YOUTUBE_VIDEO,
				});
			} else if (url.includes("spotify")) {
				result = await player.search(url, {
					requestedBy: interaction.user,
					searchEngine: QueryType.SPOTIFY_SONG });
			} else if (url.includes("soundcloud")) {
				result = await player.search(url.split("?")[0], {
					requestedBy: interaction.user,
					searchEngine: QueryType.SOUNDCLOUD_TRACK });
			}

			// finish if no tracks were found
			if (result.tracks.length === 0) {return interaction.editReply("No results");}

			// Add the track to the queue
			const song = result.tracks[0];
			try {
				await player.play(interaction.member.voice.channel, song.url, {
					nodeOptions: {

					},
				});
				embed
					.setColor("#152739")
					.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
					.setDescription(`**[${song.title}](${song.url})**\nhas been added to the Queue`)
					.setThumbnail(song.thumbnail)
					.setFooter({ text: `Duration: ${song.duration}` });
			} catch (e) {
				return interaction.followUp(e);
			}

		} else if (interaction.options.getSubcommand() === "playlist") {

			// Search for the playlist using the discord-player
			const url = interaction.options.getString("url");
			let result;

			if (url.includes("youtube") || url.includes("youtu.be")) {
				result = await player.search(url, {
					requestedBy: interaction.user,
					searchEngine: QueryType.YOUTUBE_PLAYLIST,
				});
			} else if (url.includes("spotify")) {
				result = await player.search(url, {
					requestedBy: interaction.user,
					searchEngine: QueryType.SPOTIFY_PLAYLIST,
				});
			}

			if (result.tracks.length === 0) {return interaction.editReply(`No playlists found with ${url}`);}

			const playlist = result.playlist;

			try {
				await player.play(interaction.member.voice.channel, playlist, {
					nodeOptions: {

					},
				});
				embed
					.setColor("#152739")
					.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
					.setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue.`);
			} catch (e) {
				return interaction.followUp(e);
			}


		} else if (interaction.options.getSubcommand() === "search") {
			// Search for the song using the discord-player
			const url = interaction.options.getString("searchterms");
			const result = await player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO,
			});


			// finish if no tracks were found
			if (result.tracks.length === 0) {return interaction.editReply("No results.");}

			// Add the track to the queue
			const song = result.tracks[0];

			try {
				await player.play(interaction.member.voice.channel, song.url, {
					nodeOptions: {

					},
				});
				embed
					.setColor("#152739")
					.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
					.setDescription(`**[${song.title}](${song.url})** has been added to the Queue.`)
					.setThumbnail(song.thumbnail)
					.setFooter({ text: `Duration: ${song.duration}` });
			} catch (e) {
				return interaction.followUp(e);
			}
		}
		if (queue.size < 1) {
			return interaction.editReply("Queue created");
		}
		await interaction.editReply({
			embeds: [embed],
		});

	},
};
