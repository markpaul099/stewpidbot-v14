const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Loads every command the same way index.js and deploy-commands.js do
const foldersPath = path.join(__dirname, "..", "commands");
const commandFiles = fs.readdirSync(foldersPath).flatMap(folder =>
	fs.readdirSync(path.join(foldersPath, folder))
		.filter(file => file.endsWith(".js"))
		.map(file => path.join(folder, file)));

describe("commands", () => {
	const names = new Set();

	for (const file of commandFiles) {
		it(`${file} builds valid command data`, () => {
			const command = require(path.join(foldersPath, file));
			assert.equal(typeof command.execute, "function");

			// toJSON runs discord.js's validation of names, descriptions and option limits
			const json = command.data.toJSON();
			assert.ok(!names.has(json.name), `duplicate command name ${json.name}`);
			names.add(json.name);
		});
	}
});
