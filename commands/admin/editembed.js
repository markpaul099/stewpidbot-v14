const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require("discord.js");
const { parseHexColor, unescapeNewlines } = require("../../utils/format.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("editembed")
		.setDescription("Edit an embed the bot already sent. Fields you leave out stay the same.")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel where the embed message is located.")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option =>
			option
				.setName("message")
				.setDescription("The ID of the embed message.")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("title")
				.setDescription("New embed title")
				.setMaxLength(256))
		.addStringOption(option =>
			option
				.setName("color")
				.setDescription("New embed color (hex, e.g. #2B65EC)"))
		.addStringOption(option =>
			option
				.setName("description")
				.setDescription("New text inside the embed. Use \\n for a new line.")
				.setMaxLength(4096))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const replyAndExpire = async (content, ms = 10000) => {
			await interaction.editReply({ content }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), ms);
		};

		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const channel = interaction.options.getChannel("channel");
			const msgId = interaction.options.getString("message");
			const title = interaction.options.getString("title");
			const description = interaction.options.getString("description");
			const colorInput = interaction.options.getString("color");

			if (!title && !description && !colorInput) return await replyAndExpire("Give at least one of title, color or description to change.");

			const color = colorInput ? parseHexColor(colorInput) : null;
			if (colorInput && color === null) return await replyAndExpire(`\`${colorInput}\` is not a hex color. Try something like \`#2B65EC\`.`);

			const message = await channel.messages.fetch(msgId).catch(() => null);
			if (!message) return await replyAndExpire(`Could not find a message with ID \`${msgId}\` in ${channel}.`);
			if (message.author.id !== interaction.client.user.id) return await replyAndExpire("I can only edit embeds that I sent.");
			if (!message.embeds[0]) return await replyAndExpire("That message has no embed.");

			const embed = EmbedBuilder.from(message.embeds[0]);
			if (title) embed.setTitle(title);
			if (description) embed.setDescription(unescapeNewlines(description));
			if (colorInput) embed.setColor(color);

			await message.edit({ embeds: [embed] });
			await replyAndExpire("Edited the embed.", 5000);
		} catch (error) {
			console.error("Error in editembed command:", error);
			const errorMessage = "An error occurred while editing the embed. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
