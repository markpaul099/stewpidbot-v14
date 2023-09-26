const { useMainPlayer } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Kick the bot from the channel"),
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
			// Get the current queue
			const queue = player.nodes.get(interaction.guildId);

			if (!queue) return interaction.editReply("There are no songs in the queue.");

			// Deletes all the songs from the queue and exits the channel
			queue.delete();

			await interaction.editReply("I didn't want to be here anyway, B-baka . . ! ૮₍ ˃ ⤙ ˂ ₎ა");
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};