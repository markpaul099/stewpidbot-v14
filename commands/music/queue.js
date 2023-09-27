const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("shows first 10 songs in the queue"),
	async execute(interaction) {
		try {

			const cmd_ch = await interaction.guild.channels.cache.find(channel => channel.name === "bot-commands");
			if (cmd_ch.id !== interaction.channel.id) {
				await interaction.reply({
					content: `use ${cmd_ch} for music commands`,
					ephemeral: true,
				});
				return;
			}

			const player = useMainPlayer();
			// Get the queue for the server
			const queue = player.nodes.get(interaction.guildId);

			// Check if the queue is empty
			if (!queue) {
				await interaction.reply({
					content: "There are no songs in the queue.",
					ephemeral: true,
				});
				return;
			}

			const usr_channel = interaction.member.voice.channel;
			const cli_channel = interaction.guild.members.me.voice.channel;

			// Check if user is in the same voice channel as the bot
			if (cli_channel !== usr_channel) {
				await interaction.reply({
					content: `You are not connected in ${cli_channel}`,
					ephemeral: true,
				});
				return;
			}

			// Get the first 10 songs in the queue
			const queueString = queue.tracks.store.slice(0, 10).map((song, i) => {
				return `${i + 1}) \`[${song.duration}]\` **[${song.title}](${song.url})** - <@${song.requestedBy.id}>`;
			}).join("\n");

			// Get the current song
			const currentSong = queue.currentTrack;

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("#152739")
						.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
						.setDescription("**Currently Playing**\n" +
                        (currentSong ? `\`[${currentSong.duration}]\` **[${currentSong.title}](${currentSong.url})** - <@${currentSong.requestedBy.id}>` : "None") +
                        `\n\n**Queue**\n${queueString}`,
						),
				],
			});
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command.",
				ephemeral: true,
			});
		}
	},
};