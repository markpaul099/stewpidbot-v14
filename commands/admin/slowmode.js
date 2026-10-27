const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { formatDuration } = require("../../utils/format.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("slowmode")
		.setDescription("Set how long members must wait between messages")
		.addIntegerOption(option =>
			option
				.setName("seconds")
				.setDescription("Seconds between messages (max 21600 = 6 hours). 0 turns slowmode off.")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(21600))
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel to change (defaults to this one)")
				.setRequired(false)
				.addChannelTypes(ChannelType.GuildText))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

			const seconds = interaction.options.getInteger("seconds");
			const channel = interaction.options.getChannel("channel") ?? interaction.channel;

			await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.username}`);

			const content = seconds === 0
				? `Slowmode is off in ${channel}.`
				: `Slowmode in ${channel} is now ${formatDuration(seconds * 1000)}.`;
			await interaction.editReply({ content }).catch(() => { /* Catch */ });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
		} catch (error) {
			console.error("Error in slowmode command:", error);
			const errorMessage = "An error occurred while setting slowmode. Make sure I have the Manage Channels permission there.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
