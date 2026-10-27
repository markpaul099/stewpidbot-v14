const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require("discord.js");
const { parseHexColor, unescapeNewlines } = require("../../utils/format.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription("Send an embed to a channel")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel where to send embed")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option =>
			option
				.setName("content")
				.setDescription("Text inside the embed. Use \\n for a new line.")
				.setMaxLength(4096))
		.addStringOption(option =>
			option
				.setName("title")
				.setDescription("Embed Title")
				.setMaxLength(256))
		.addStringOption(option =>
			option
				.setName("color")
				.setDescription("Embed color (hex, e.g. #2B65EC)"))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const channel = interaction.options.getChannel("channel");
			const content = interaction.options.getString("content");
			const colorInput = interaction.options.getString("color");
			const title = interaction.options.getString("title");

			let problem = null;
			if (!content && !title) problem = "Give the embed a title, some content, or both.";
			else if (colorInput && parseHexColor(colorInput) === null) problem = `\`${colorInput}\` is not a hex color. Try something like \`#2B65EC\`.`;

			if (problem) {
				await interaction.editReply({ content: problem }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			const embed = new EmbedBuilder()
				.setTitle(title)
				.setColor(colorInput ? parseHexColor(colorInput) : null)
				.setDescription(content ? unescapeNewlines(content) : null);

			await channel.send({ embeds: [embed] });
			await interaction.editReply(`Embed sent to ${channel}.`);
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
		} catch (error) {
			console.error("Error in embed command:", error);
			const errorMessage = "An error occurred while sending the embed. Make sure I can send messages in that channel.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
