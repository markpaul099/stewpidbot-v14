const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("addreaction")
		.setDescription("Add reaction to a comment")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The ID of the Channel Where the Message is Located")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option =>
			option
				.setName("message")
				.setDescription("The ID of the Message to Add Reaction")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reaction")
				.setDescription("Reaction to Add")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			const channelName = interaction.options.getChannel("channel");
			const msgId = interaction.options.getString("message");
			const Reaction = interaction.options.getString("reaction");

			const channel = await interaction.guild.channels.cache.get(channelName.id);
			const message = await channel.messages.fetch(msgId);

			await message.react(Reaction);
			await interaction.editReply("added reaction");
			setTimeout(() => interaction.deleteReply(), 5000);
		} catch (error) {
			console.error("Error in addreaction command:", error);
			const errorMessage = "An error occurred while adding reaction. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};
