const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear a specific amount of messages from a user or channel")
		.addIntegerOption(option =>
			option
				.setName("amount")
				.setDescription("Amount of message to be cleared.")
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(99))
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("Select a user to clear their message")
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const amount = interaction.options.getInteger("amount");
			const user = interaction.options.getUser("user");

			const result = new EmbedBuilder()
				.setColor("#2B65EC");

			if (user) {
				const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
				const userMessages = fetchedMessages.filter(msg => msg.author.id === user.id).first(amount);
				const deleted = await interaction.channel.bulkDelete(userMessages, true);

				result.setDescription(`Successfully deleted ${deleted.size} messages from ${user}.`);
				await interaction.editReply({ embeds: [result] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);

			} else {
				const deleted = await interaction.channel.bulkDelete(amount, true);

				result.setDescription(`Successfully deleted ${deleted.size} messages from the channel.`);
				await interaction.editReply({ embeds: [result] }).catch(() => { /* Catch */ });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
			}

		} catch (error) {
			console.error("Error in clear command:", error);
			const errorMessage = "An error occurred while clearing messages. (Note: Messages older than 14 days cannot be bulk deleted).";

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}

			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};