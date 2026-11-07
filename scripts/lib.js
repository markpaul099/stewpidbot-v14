// Shared helpers for the terminal checks in scripts/check.js and scripts/smoke.js
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const SNOWFLAKE = /^\d{17,20}$/;

// Collects results and prints them as they come. Warnings point at something to look at but don't fail the run.
function createReport() {
	const counts = { pass: 0, warn: 0, fail: 0 };
	const marks = { pass: "  ok  ", warn: "  warn", fail: "  FAIL" };

	function add(level, message, hint) {
		counts[level]++;
		console.log(`${marks[level]}  ${message}`);
		if (hint) console.log(`        ${hint}`);
	}

	return {
		counts,
		section(title) { console.log(`\n${title}`); },
		pass: message => add("pass", message),
		warn: (message, hint) => add("warn", message, hint),
		fail: (message, hint) => add("fail", message, hint),
		// Passes when `ok` is true, otherwise fails (or warns, with { warn: true })
		check(ok, message, hint, { warn = false } = {}) {
			if (ok) add("pass", message);
			else add(warn ? "warn" : "fail", message, hint);
			return ok;
		},
		// Prints the summary and returns the exit code: 0 when nothing failed
		finish(label) {
			console.log(`\n${counts.pass} passed, ${counts.warn} warnings, ${counts.fail} failed${label ? ` (${label})` : ""}`);
			return counts.fail === 0 ? 0 : 1;
		},
	};
}

// Lists every command file as "folder/file.js", the same files index.js and deploy-commands.js load
function commandFiles() {
	const foldersPath = path.join(root, "commands");
	return fs.readdirSync(foldersPath).flatMap(folder =>
		fs.readdirSync(path.join(foldersPath, folder))
			.filter(file => file.endsWith(".js"))
			.map(file => `${folder}/${file}`));
}

function eventFiles() {
	return fs.readdirSync(path.join(root, "events")).filter(file => file.endsWith(".js"));
}

// Returns the JSON each command would deploy, keyed by name. Files that fail to load are skipped.
function localCommandData() {
	const data = new Map();
	for (const file of commandFiles()) {
		try {
			const command = require(path.join(root, "commands", file));
			const json = command.data.toJSON();
			data.set(json.name, json);
		} catch {
			// scripts/check.js reports broken files
		}
	}
	return data;
}

// The channel and role names the bot looks up on every server
const channelKeys = ["logsChannel", "welcomeChannel", "commandChannel", "requestChannel", "newsChannel"];

module.exports = { root, SNOWFLAKE, createReport, commandFiles, eventFiles, localCommandData, channelKeys };
