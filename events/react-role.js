const { Events } = require("discord.js");
const { ReactionRole } = require("discordjs-reaction-role");
const fs = require("node:fs");
const path = require("node:path");
const networkState = require("../networkState.js");

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
		const config = require(configPath);
		// eslint-disable-next-line no-unused-vars
		const rr = new ReactionRole(client, config.configuration);
	},
};