const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { findChannel } = require("../../utils/channels.js");
const { unescapeNewlines } = require("../../utils/format.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("announce")
		.setDescription("Post an announcement in the news channel")
		.addStringOption(option =>
			option
				.setName("message")
				.setDescription("The announcement. Use \\n for a new line.")
				.setRequired(true)
				.setMaxLength(2000)),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const newsChannel = findChannel(interaction.guild, process.env.newsChannel);
			if (!newsChannel) {
				await interaction.editReply({ content: `This server has no #${process.env.newsChannel} channel.` }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			// Anyone who could post in the news channel themselves may announce through the bot
			if (!interaction.member.permissionsIn(newsChannel).has(PermissionFlagsBits.SendMessages)) {
				await interaction.editReply({ content: `You lack permission to post in ${newsChannel}.` }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			const content = unescapeNewlines(interaction.options.getString("message"));
			await newsChannel.send(content);

			await interaction.editReply({ content: `Posted in ${newsChannel}.` }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
		} catch (error) {
			console.error("Error in announce command:", error);
			const errorMessage = "An error occurred while posting the announcement. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
