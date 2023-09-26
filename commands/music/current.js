const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("current")
		.setDescription("The song currently playing."),
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

			const player = useMainPlayer();
			const queue = player.nodes.get(interaction.guildId);
			const embed = new EmbedBuilder();

			if (!queue) {
				return interaction.reply("There are no songs in the queue.");
			}

			const progress = queue.node.createProgressBar();

			embed
				.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
				.setTitle("Playing")
				.setColor("#152739")
				.setDescription(`**[${queue.currentTrack.title}](${queue.currentTrack.url}) • ${`${queue.currentTrack.duration}`}**\n\n${progress.replace(/ 0:00/g, "LIVE")}`)
				.setThumbnail(`${queue.currentTrack.thumbnail}`);

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};