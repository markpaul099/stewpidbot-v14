const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { requireOwner } = require("../../utils/permissions.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("say")
		.setDescription("Make the bot send a message in this channel (bot owner only)")
		.addStringOption(option =>
			option
				.setName("message")
				.setDescription("What to say. Use \\n for a new line.")
				.setRequired(true)
				.setMaxLength(2000))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			if (!(await requireOwner(interaction))) return;
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const content = interaction.options.getString("message").replace(/\\n/g, "\n");
			await interaction.channel.send(content);

			await interaction.editReply({ content: "Sent." }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
		} catch (error) {
			console.error("Error in say command:", error);
			const errorMessage = "An error occurred while sending the message. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
