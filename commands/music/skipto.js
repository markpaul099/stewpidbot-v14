const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("skipto")
		.setDescription("Skips to a specific song in the queue")
		.addStringOption(option =>
			option
				.setName("number")
				.setDescription("Number in the queue")
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const player = useMainPlayer();
			// Get the queue for the server
			const queue = player.nodes.get(interaction.guildId);
			const channel = interaction.member.voice.channel;

			// If there is no queue, return
			if (!queue) {
				await interaction.editReply("There are no songs in the queue");
				return;
			}

			// If the member is not in a voice channel, return
			if (!channel) {
				return interaction.editReply({
					content: "You are not connected to a voice channel.",
					ephemeral: true,
				});
			}


			// Retrieve the number to skip to and get the size of current queue
			let number = interaction.options.getString("number");
			number = +number;
			const queueSize = queue.getSize();

			// If the size of the queue is equal to or bigger than the number skip to that song in the queue
			if (queueSize >= number && number > 0) {
				queue.node.skipTo(number - 1);
				if (number == 1) {
					await interaction.editReply("You can use regular /skip to skip 1 song.");
				} else {
					await interaction.editReply(`Skipped to song number ${number} in the queue.`);
				}
			} else {
				await interaction.editReply("I can't skip to that!");
			}
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: "There was an error while executing this command." });
		}
	},
};