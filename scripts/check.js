// Offline development check: configuration, commands and events, without connecting to Discord.
// Run: npm run check
const fs = require("node:fs");
const path = require("node:path");
const { Events } = require("discord.js");
const { root, SNOWFLAKE, createReport, commandFiles, eventFiles, channelKeys } = require("./lib.js");

const report = createReport();
const envPath = path.join(root, ".env");
const hasEnvFile = fs.existsSync(envPath);
require("../utils/env.js");
const env = process.env;

// ---- Node.js ----
report.section("Node.js");
const required = require("../package.json").engines.node.replace(/^>=/, "");
const atLeast = (version, min) => {
	const a = version.split(".").map(Number);
	const b = min.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		if (a[i] !== b[i]) return a[i] > b[i];
	}
	return true;
};
report.check(atLeast(process.versions.node, required), `Node.js ${process.versions.node} (needs ${required} or later)`, "Install a newer Node.js.");

// ---- .env ----
report.section("Configuration (.env)");
report.check(hasEnvFile, hasEnvFile ? ".env file found" : "no .env file", "Copy .env-sample to .env and fill it in, unless the host sets the variables itself.", { warn: true });

const token = env.token ?? "";
const tokenShape = /^[\w-]{20,}\.[\w-]{4,}\.[\w-]{20,}$/.test(token);
if (report.check(token !== "", "token is set", "Add the bot token from the Discord Developer Portal (Bot > Reset Token).")) {
	report.check(tokenShape, "token looks like a bot token", "A bot token has three parts separated by dots. Check for stray quotes or spaces.");
}

for (const key of ["clientId", "botOwnerId"]) {
	if (report.check(Boolean(env[key]), `${key} is set`, `Add ${key} to .env.`)) {
		report.check(SNOWFLAKE.test(env[key]), `${key} is a Discord ID`, `${key} should be 17 to 20 digits, got "${env[key]}".`);
	}
}

// The first part of a bot token is the bot's user ID, which matches the application ID
if (tokenShape && SNOWFLAKE.test(env.clientId ?? "")) {
	const tokenId = Buffer.from(token.split(".")[0], "base64").toString("utf8");
	report.check(tokenId === env.clientId, "token belongs to clientId", `The token is for bot ${tokenId}. npm run deploy would register commands on a different bot.`);
}

if (env.testAccount) {
	report.check(SNOWFLAKE.test(env.testAccount), "testAccount is a Discord ID", `testAccount should be 17 to 20 digits, got "${env.testAccount}".`, { warn: true });
}

for (const key of [...channelKeys, "newMemberRole"]) {
	report.check(Boolean(env[key]?.trim()), `${key} = ${env[key]?.trim() || "(blank)"}`, "Blank turns this feature off on every server.", { warn: true });
}

// ---- Commands ----
report.section("Commands");
const names = new Map();
for (const file of commandFiles()) {
	try {
		const command = require(path.join(root, "commands", file));
		if (!command.data || typeof command.execute !== "function") {
			report.fail(file, "Export both data and execute, or index.js skips this command.");
			continue;
		}
		// toJSON runs discord.js's validation of names, descriptions and option limits
		const json = command.data.toJSON();
		if (names.has(json.name)) {
			report.fail(`${file}: /${json.name}`, `Same name as ${names.get(json.name)}. Discord keeps only one of them.`);
			continue;
		}
		names.set(json.name, file);
	} catch (error) {
		report.fail(file, error.message.split("\n")[0]);
	}
}
report.check(names.size === commandFiles().length, `${names.size} of ${commandFiles().length} commands load and build valid data`);
// Discord allows at most 100 global slash commands
report.check(names.size <= 100, `${names.size} of Discord's 100 global commands used`);

// ---- Events ----
report.section("Events");
const eventNames = new Set(Object.values(Events));
let goodEvents = 0;
for (const file of eventFiles()) {
	try {
		const event = require(path.join(root, "events", file));
		if (typeof event.execute !== "function") {
			report.fail(file, "Export an execute function.");
		} else if (!eventNames.has(event.name)) {
			report.fail(file, `"${event.name}" is not a discord.js event name, so it never fires.`);
		} else {
			goodEvents++;
		}
	} catch (error) {
		report.fail(file, error.message.split("\n")[0]);
	}
}
report.check(goodEvents === eventFiles().length, `${goodEvents} of ${eventFiles().length} events load`);

// ---- Files ----
report.section("Files");
report.check(fs.existsSync(path.join(root, "assets", "welcome.jpg")), "assets/welcome.jpg exists", "The welcome image can't be drawn without it.");

const reactPath = path.join(root, "react-config.js");
if (!fs.existsSync(reactPath)) {
	report.warn("react-config.js not found", "Reaction roles stay off. Copy react-config-sample.js to turn them on.");
} else {
	try {
		const entries = require(reactPath).configuration;
		if (!Array.isArray(entries)) throw new Error("configuration must be an array");
		const bad = entries
			.map((entry, i) => [i, entry])
			.filter(([, entry]) => !SNOWFLAKE.test(entry.messageId ?? "") || !SNOWFLAKE.test(entry.roleId ?? "") || !entry.reaction)
			.map(([i]) => i + 1);
		report.check(bad.length === 0, `react-config.js has ${entries.length} valid reaction roles`, `Entries ${bad.join(", ")} need a messageId, a roleId (17 to 20 digits) and a reaction.`);
	} catch (error) {
		report.fail("react-config.js loads", error.message.split("\n")[0]);
	}
}

process.exitCode = report.finish(hasEnvFile ? ".env" : "environment");
