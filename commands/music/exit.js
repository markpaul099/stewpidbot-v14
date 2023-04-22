const { useMasterPlayer } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("exit")
		.setDescription("Kick the bot from the channel"),
	async execute(interaction) {
		// Let the Discord Client know the bot is alive
		await interaction.deferReply();

		const player = useMasterPlayer();
		// Get the current queue
		const queue = player.nodes.get(interaction.guildId);

		if (!queue) {
			await interaction.editReply("There are no songs in the queue.");
			return;
		}

		// Deletes all the songs from the queue and exits the channel
		queue.delete();

		await interaction.editReply("I didn't want to be here anyway, B-baka . . ! ૮₍ ˃ ⤙ ˂ ₎ა");
	},
};