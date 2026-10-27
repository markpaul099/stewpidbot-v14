const { MessageFlags } = require("discord.js");

function isBotOwner(user) {
	return Boolean(process.env.botOwnerId) && user?.id === process.env.botOwnerId;
}

// Returns true if the bot owner ran the command. Otherwise tells the user and returns false.
// Call before deferring the reply.
async function requireOwner(interaction) {
	if (isBotOwner(interaction.user)) return true;

	await interaction.reply({ content: "Only the bot owner can use this command.", flags: [MessageFlags.Ephemeral] });
	setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 5000);
	return false;
}

module.exports = { isBotOwner, requireOwner };
