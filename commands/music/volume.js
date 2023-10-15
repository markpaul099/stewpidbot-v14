const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");

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
		try {

			const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === process.env.commandChannel);
			if (cmdChannel.id !== interaction.channel.id) {
				await interaction.reply({
					content: `use ${cmdChannel} for music commands`,
					ephemeral: true,
				});
				return;
			}

			const volume = interaction.options.getInteger("value");

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

			// Skip the current song
			queue.node.setVolume(volume);

			await interaction.reply(`Volume has been set to ${volume}%`);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command.",
				ephemeral: true,
			});
		}
	},
};