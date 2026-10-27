const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { unescapeNewlines } = require("../../utils/format.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("editmessage")
		.setDescription("Edit a message the bot already sent")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel where the message is located.")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option =>
			option
				.setName("message")
				.setDescription("The ID of the message.")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("content")
				.setDescription("New content of the message. Use \\n for a new line.")
				.setRequired(true)
				.setMaxLength(2000))
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
			const content = unescapeNewlines(interaction.options.getString("content"));

			const message = await channel.messages.fetch(msgId).catch(() => null);
			if (!message) return await replyAndExpire(`Could not find a message with ID \`${msgId}\` in ${channel}.`);
			if (message.author.id !== interaction.client.user.id) return await replyAndExpire("I can only edit messages that I sent.");

			await message.edit(content);
			await replyAndExpire("Edited the message.", 5000);
		} catch (error) {
			console.error("Error in editmessage command:", error);
			const errorMessage = "An error occurred while editing the message. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
