const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("addreaction")
		.setDescription("Add reaction to a message")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel where the message is located")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option =>
			option
				.setName("message")
				.setDescription("The ID of the message to add a reaction to")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reaction")
				.setDescription("Reaction to add (Unicode emoji or Custom Emoji ID)")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const targetChannel = interaction.options.getChannel("channel");
			const msgId = interaction.options.getString("message");
			const reaction = interaction.options.getString("reaction");

			const message = await targetChannel.messages.fetch(msgId).catch(() => null);

			if (!message) {
				await interaction.editReply({ content: `Could not find a message with ID \`${msgId}\` in ${targetChannel}.` }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
				return;
			}

			try {
				await message.react(reaction);
				await interaction.editReply({ content: "Successfully added the reaction to the message." }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
			} catch (reactError) {
				console.error("Failed to add reaction:", reactError);
				await interaction.editReply({
					content: "Failed to add the reaction. Make sure you provided a valid Unicode emoji or custom emoji ID, and that I have permissions to react.",
				}).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
			}

		} catch (error) {
			console.error("Error in addreaction command:", error);
			const errorMessage = "An error occurred while adding the reaction. Please try again.";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};