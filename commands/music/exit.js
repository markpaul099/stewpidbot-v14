const { useMasterPlayer } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("exit")
		.setDescription("Kick the bot from the channel"),
	async execute(interaction) {
		await interaction.deferReply();
		try {

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
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};