const { SlashCommandBuilder } = require("discord.js");
const { useQueue, QueueRepeatMode } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Enable or disable looping of songs or the whole queue")
		.addStringOption(option =>
			option
				.setName("action")
				.setDescription("What action you want to preform on the loop")
				.setRequired(true)
				.addChoices(
					{ name: "Song", value: "enable_loop_song" },
					{ name: "Queue", value: "enable_loop_queue" },
					{ name: "Disabled", value: "disable_loop" },
				)),
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

			const queue = useQueue(interaction.guild.id);

			if (!queue || !queue.node.isPlaying()) {
				await interaction.reply({
					content: "There is no music currently playing.",
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

			switch (interaction.options.getString("action")) {
			case "enable_loop_song": {
				queue.setRepeatMode(QueueRepeatMode.TRACK);

				return interaction.reply(
					"Repeat mode **enabled**. The current song will be repeated endlessly (you can end the loop with **/loop Disable**).",
				);
			}
			case "enable_loop_queue": {
				queue.setRepeatMode(QueueRepeatMode.QUEUE);

				return interaction.reply(
					"Repeat mode **enabled** for the whole queue. It will be repeated endlessly (you can end the loop with **/loop Disable**).",
				);
			}
			case "disable_loop": {
				queue.setRepeatMode(QueueRepeatMode.OFF);

				return interaction.reply("Repeat mode **disabled**.");
			}
			}
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