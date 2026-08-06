const { Events } = require("discord.js");
const { ReactionRole } = require("discordjs-reaction-role");
const config = require("../react-config.js");
const networkState = require("../networkState.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		if (networkState.isInternetDown) return;
		// eslint-disable-next-line no-unused-vars
		const rr = new ReactionRole(client, config.configuration);
	},
};