const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("current")
		.setDescription("The song currently playing."),
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
			const queue = player.nodes.get(interaction.guildId);
			const embed = new EmbedBuilder();

			// Return if queue is empty
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

			const progress = queue.node.createProgressBar();

			embed
				.setAuthor({ name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
				.setTitle("Playing")
				.setColor("#152739")
				.setDescription(`**[${queue.currentTrack.title}](${queue.currentTrack.url}) • ${`${queue.currentTrack.duration}`}**\n\n${progress.replace(/ 0:00/g, "LIVE")}`)
				.setThumbnail(`${queue.currentTrack.thumbnail}`);

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