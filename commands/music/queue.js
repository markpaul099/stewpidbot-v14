const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("shows first 10 songs in the queue"),
	async execute(interaction) {
		await interaction.deferReply();
		try {

			const player = useMainPlayer();
			// Get the queue for the server
			const queue = player.nodes.get(interaction.guildId);

			// check if there are songs in the queue
			if (!queue) {
				await interaction.editReply("There are no songs in the queue.");
				return;
			}

			// Get the first 10 songs in the queue
			const queueString = queue.tracks.store.slice(0, 10).map((song, i) => {
				return `${i + 1}) \`[${song.duration}]\` **[${song.title}](${song.url})** - <@${song.requestedBy.id}>`;
			}).join("\n");

			// Get the current song
			const currentSong = queue.currentTrack;

			await interaction.editReply({
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
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};