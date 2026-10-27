const { Events } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const networkState = require("../networkState.js");

// Accepts a unicode emoji ("✅"), a custom emoji id ("123...") or a custom emoji string ("<:name:id>" / "<a:name:id>")
function normalizeReaction(reaction) {
	const value = String(reaction);
	const custom = value.match(/^<a?:\w+:(\d+)>$/);
	return custom ? custom[1] : value;
}

// Custom emoji match by id first, then by name (same order as discordjs-reaction-role)
function findRoleId(config, reaction) {
	const { id, name } = reaction.emoji;
	const entries = config.filter(entry => entry.messageId === reaction.message.id);
	const match = (id && entries.find(entry => entry.key === id)) ||
		(name && entries.find(entry => entry.key === name));
	return match?.roleId ?? null;
}

async function handleReaction(config, reaction, user, action) {
	if (networkState.isInternetDown) return;

	// A partial user may not have the bot flag yet, so fetch before checking it
	try {
		if (reaction.partial) await reaction.fetch();
		if (user.partial) await user.fetch();
	} catch (error) {
		console.error("[ReactionRole] Failed to fetch partial reaction or user:", error.message);
		return;
	}

	if (user.bot) return;

	const guild = reaction.message.guild;
	if (!guild) return;

	const roleId = findRoleId(config, reaction);
	if (!roleId) return;

	try {
		const member = await guild.members.fetch(user.id);
		if (action === "add") {
			await member.roles.add(roleId);
		} else {
			await member.roles.remove(roleId);
		}
	} catch (error) {
		console.error(`[ReactionRole] Failed to ${action} role ${roleId} for ${user.tag ?? user.id}:`, error.message);
	}
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		if (networkState.isInternetDown) return;

		// react-config.js is optional and gitignored, see react-config-sample.js
		const configPath = path.join(__dirname, "..", "react-config.js");
		if (!fs.existsSync(configPath)) {
			console.log("[ReactionRole] react-config.js not found, reaction roles disabled.");
			return;
		}
		const config = require(configPath).configuration.map(entry => ({
			...entry,
			key: normalizeReaction(entry.reaction),
		}));

		client.on(Events.MessageReactionAdd, (reaction, user) => handleReaction(config, reaction, user, "add"));
		client.on(Events.MessageReactionRemove, (reaction, user) => handleReaction(config, reaction, user, "remove"));
	},
};
