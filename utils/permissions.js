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

// Returns why the moderator can't use `action` (e.g. "ban") on the target member, or null if they can.
function moderationBlocker(interaction, target, action) {
	const { guild, member: moderator } = interaction;
	const name = target.displayName ?? target.user?.username;

	if (target.id === interaction.user.id) return `You can't ${action} yourself.`;
	if (target.id === interaction.client.user.id) return `I can't ${action} myself.`;
	if (target.id === guild.ownerId) return `You can't ${action} the server owner.`;

	// The server owner outranks everyone regardless of roles
	if (moderator.id !== guild.ownerId && target.roles.highest.position >= moderator.roles.highest.position) {
		return `You can't ${action} ${name} since they have a higher or equal role to yours.`;
	}
	if (target.roles.highest.position >= guild.members.me.roles.highest.position) {
		return `I can't ${action} ${name} because their highest role is above or equal to mine.`;
	}
	return null;
}

module.exports = { isBotOwner, requireOwner, moderationBlocker };
