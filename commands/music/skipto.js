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

			// Retrieve the number to skip to and get the size of current queue
			let number = interaction.options.getString("number");
			number = +number;
			const queueSize = queue.getSize();

			// If the size of the queue is equal to or bigger than the number skip to that song in the queue
			if (queueSize >= number && number > 0) {
				queue.node.skipTo(number - 1);
				if (number == 1) {
					await interaction.reply("You can use regular /skip to skip 1 song.");
				} else {
					await interaction.reply(`Skipped to song number ${number} in the queue.`);
				}
			} else {
				await interaction.reply("I can't skip to that!");
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command.",
				ephemeral: true,
			});
		}
	},
};