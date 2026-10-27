const { ChannelType, MessageFlags } = require("discord.js");

// Find a text channel by name. Returns null if the server doesn't have one.
function findChannel(guild, name) {
	if (!guild || !name) return null;
	return guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildText) ?? null;
}

// Returns true if the command may run in this channel. Otherwise points the user to the commands channel.
// Servers without a commands channel allow the command anywhere.
async function inCommandChannel(interaction, label = "game commands") {
	const cmdChannel = findChannel(interaction.guild, process.env.commandChannel);
	if (!cmdChannel || cmdChannel.id === interaction.channelId) return true;

	await interaction.reply({ content: `use ${cmdChannel} for ${label}`, flags: [MessageFlags.Ephemeral] });
	setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
	return false;
}

module.exports = { findChannel, inCommandChannel };
