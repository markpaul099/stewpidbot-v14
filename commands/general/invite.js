const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { findChannel } = require("../../utils/channels.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite link"),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			const inviteChannel = findChannel(interaction.guild, process.env.welcomeChannel) ?? interaction.channel;
			const invLink = await inviteChannel.createInvite();
			await interaction.editReply(`Invite link: ${invLink}`);
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 60000);
		} catch (error) {
			console.error("Error in invite command:", error);
			const errorMessage = "An error occurred while creating the invite. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: errorMessage }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};
