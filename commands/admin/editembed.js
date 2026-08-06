const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("editembed")
		.setDescription("Edit an already sent embed")
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
				.setDescription("Embed Title"))
		.addStringOption(option =>
			option
				.setName("color")
				.setDescription("Embed color (hex)"))
		.addStringOption(option =>
			option
				.setName("description")
				.setDescription("Text inside the embed"))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			const channelName = interaction.options.getChannel("channel");
			const msgId = interaction.options.getString("message");
			const title = interaction.options.getString("title");
			const description = interaction.options.getString("description").replace(/\\n/g, "\r\n");
			const color = interaction.options.getString("color");

			const channel = interaction.guild.channels.cache.get(channelName.id);
			const message = await channel.messages.fetch(msgId);

			const embed = EmbedBuilder.from(message.embeds[0])
				.setTitle(title)
				.setColor(color)
				.setDescription(description);

			await message.edit({ embeds: [embed] });
			await interaction.editReply("Edited the embed.");
			setTimeout(() => interaction.deleteReply(), 5000);
		} catch (error) {
			console.error("Error in editembed command:", error);
			const errorMessage = "An error occurred while editing the embed. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
