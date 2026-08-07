const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("editmessage")
		.setDescription("Edit an already sent message")
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
				.setDescription("Content of message")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const channelName = interaction.options.getChannel("channel");
			const msgId = interaction.options.getString("message");
			const description = interaction.options.getString("content").replace(/\\n/g, "\r\n");

			const channel = interaction.guild.channels.cache.get(channelName.id);
			const message = await channel.messages.fetch(msgId);

			await message.edit(description);
			await interaction.editReply("Edited the message.");
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
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
