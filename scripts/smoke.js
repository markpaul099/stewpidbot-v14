// Live smoke test: signs in to Discord once with the bot token and checks the setup on every server.
// Read-only: it registers no event handlers, sends no messages and changes nothing, then signs out.
// Safe to run while the bot is running elsewhere (Discord allows more than one session per token).
// Run: npm run smoke
const { Client, Events, GatewayIntentBits, PermissionFlagsBits, PermissionsBitField, Routes } = require("discord.js");
const { SNOWFLAKE, createReport, localCommandData, channelKeys } = require("./lib.js");
const { findChannel } = require("../utils/channels.js");
const fs = require("node:fs");
const path = require("node:path");
require("../utils/env.js");

const LOGIN_TIMEOUT = 30_000;
const env = process.env;
const report = createReport();

// The permissions the README asks for when inviting the bot
const neededPermissions = [
	"ManageRoles", "ManageChannels", "ManageMessages", "KickMembers", "BanMembers", "ModerateMembers",
	"CreateInstantInvite", "ViewChannel", "SendMessages", "EmbedLinks", "AttachFiles", "ReadMessageHistory", "AddReactions",
];

// Keeps only the fields `npm run deploy` sends, so local and deployed commands compare equal when nothing changed
function normalizeOptions(options = []) {
	return options.map(o => {
		const out = {
			type: o.type, name: o.name, description: o.description, required: Boolean(o.required),
			autocomplete: Boolean(o.autocomplete), min_value: o.min_value, max_value: o.max_value,
			min_length: o.min_length, max_length: o.max_length,
			channel_types: o.channel_types ? [...o.channel_types].sort() : undefined,
			choices: o.choices?.map(c => ({ name: c.name, value: c.value })),
			options: o.options ? normalizeOptions(o.options) : undefined,
		};
		return JSON.parse(JSON.stringify(out));
	});
}

function normalizeCommand(c) {
	return JSON.stringify({
		name: c.name,
		description: c.description,
		default_member_permissions: c.default_member_permissions ?? null,
		options: normalizeOptions(c.options),
	});
}

async function checkCommands(client) {
	report.section("Slash commands");
	const local = localCommandData();
	const started = Date.now();
	const deployed = await client.rest.get(Routes.applicationCommands(client.application.id));
	report.pass(`fetched ${deployed.length} deployed commands (REST round trip ${Date.now() - started} ms)`);

	const deployedByName = new Map(deployed.map(c => [c.name, c]));
	const missing = [...local.keys()].filter(name => !deployedByName.has(name));
	const extra = [...deployedByName.keys()].filter(name => !local.has(name));
	const changed = [...local.keys()].filter(name =>
		deployedByName.has(name) && normalizeCommand(local.get(name)) !== normalizeCommand(deployedByName.get(name)));

	const deployHint = "Run npm run deploy to update Discord.";
	report.check(missing.length === 0, missing.length ? `not deployed yet: /${missing.join(", /")}` : "every local command is deployed", deployHint, { warn: true });
	report.check(changed.length === 0, changed.length ? `changed since the last deploy: /${changed.join(", /")}` : "deployed commands match the local files", deployHint, { warn: true });
	report.check(extra.length === 0, extra.length ? `deployed but no longer in commands/: /${extra.join(", /")}` : "no leftover deployed commands", deployHint, { warn: true });
}

async function checkGuild(client, guild) {
	report.section(`Server: ${guild.name} (${guild.memberCount} members)`);
	const me = await guild.members.fetchMe();
	const perms = me.permissions;

	const lacking = perms.has(PermissionFlagsBits.Administrator) ? [] : neededPermissions.filter(p => !perms.has(PermissionsBitField.Flags[p]));
	report.check(lacking.length === 0, lacking.length ? `missing permissions: ${lacking.join(", ")}` : "bot has every permission it needs",
		"Give the bot's role these permissions in Server Settings > Roles.", { warn: true });

	for (const key of channelKeys) {
		const name = env[key]?.trim();
		if (!name) continue;
		const channel = findChannel(guild, name);
		if (!channel) {
			const hint = key === "welcomeChannel" ? "The bot creates it on the next join if it has Manage Channels." : "That feature is skipped on this server.";
			report.warn(`#${name} (${key}) not found`, hint);
			continue;
		}
		const can = channel.permissionsFor(me);
		const ok = can.has(PermissionFlagsBits.ViewChannel) && can.has(PermissionFlagsBits.SendMessages);
		report.check(ok, `#${name} (${key}) found${ok ? "" : ", but the bot can't post there"}`, "Allow the bot to view and send messages in that channel.", { warn: true });
	}

	const roleName = env.newMemberRole?.trim();
	if (roleName) {
		const role = guild.roles.cache.find(r => r.name === roleName);
		if (!role) {
			report.check(perms.has(PermissionFlagsBits.ManageRoles), `role "${roleName}" not found, the bot will create it`, "The bot needs Manage Roles to create it.", { warn: true });
		} else {
			report.check(role.position < me.roles.highest.position, `role "${roleName}" is below the bot's role`, "Drag the bot's role above it in Server Settings > Roles, or new members get no role.", { warn: true });
		}
	}

	const guildCommands = await client.rest.get(Routes.applicationGuildCommands(client.application.id, guild.id));
	report.check(guildCommands.length === 0, guildCommands.length ? `${guildCommands.length} server-only commands registered` : "no server-only commands",
		"These show up next to the global ones as duplicates. npm run deploy only registers global commands.", { warn: true });
}

function checkReactionRoles(client) {
	const configPath = path.join(__dirname, "..", "react-config.js");
	if (!fs.existsSync(configPath)) return;
	report.section("Reaction roles");
	for (const entry of require(configPath).configuration ?? []) {
		const guild = client.guilds.cache.find(g => g.roles.cache.has(entry.roleId));
		const role = guild?.roles.cache.get(entry.roleId);
		if (!role) {
			report.warn(`${entry.reaction} → role ${entry.roleId} not found on any server`, "Check the roleId in react-config.js.");
			continue;
		}
		report.check(role.position < guild.members.me.roles.highest.position, `${entry.reaction} → @${role.name} (${guild.name})`,
			"The bot's role must be above this role to give it out.", { warn: true });
	}
}

async function main() {
	if (!env.token) {
		console.log("No token set. Run npm run check first.");
		return 2;
	}

	// Same intents as index.js, so a missing privileged intent fails here too
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildModeration,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildMembers,
		],
	});

	report.section("Sign-in");
	const started = Date.now();
	try {
		let timer;
		const ready = new Promise(resolve => client.once(Events.ClientReady, resolve));
		const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), LOGIN_TIMEOUT); });
		await Promise.race([client.login(env.token).then(() => ready), timeout]).finally(() => clearTimeout(timer));
	} catch (error) {
		await client.destroy();
		if (error.message === "timeout") {
			report.fail(`no answer from Discord within ${LOGIN_TIMEOUT / 1000} s`, "Check the internet connection.");
			report.finish();
			return 2;
		}
		if (/disallowed intents/i.test(error.message)) {
			report.fail("Discord refused the bot's intents", "Turn on Server Members Intent and Message Content Intent in the Developer Portal (Bot > Privileged Gateway Intents).");
		} else if (error.code === "TokenInvalid" || /invalid token/i.test(error.message)) {
			report.fail("Discord rejected the token", "Reset the token in the Developer Portal and update .env.");
		} else {
			report.fail("sign-in failed", error.message);
		}
		return report.finish();
	}

	try {
		report.pass(`signed in as ${client.user.tag} in ${Date.now() - started} ms`);
		report.pass("privileged intents allowed");
		report.check(client.application.id === env.clientId, `clientId matches this bot (${client.application.id})`,
			`clientId in .env is ${env.clientId || "blank"}. npm run deploy registers commands on that application instead.`);

		if (SNOWFLAKE.test(env.botOwnerId ?? "")) {
			const owner = await client.users.fetch(env.botOwnerId).catch(() => null);
			report.check(Boolean(owner), owner ? `botOwnerId is ${owner.tag}` : `botOwnerId ${env.botOwnerId} is not a Discord user`, "Owner-only commands won't work for anyone.");
		} else {
			report.fail("botOwnerId is not a Discord ID", "Owner-only commands won't work for anyone.");
		}
		report.check(client.guilds.cache.size > 0, `in ${client.guilds.cache.size} servers`, "Invite the bot to a server with the link from /invite or the Developer Portal.", { warn: true });

		await checkCommands(client);
		for (const guild of client.guilds.cache.values()) {
			await checkGuild(client, guild);
		}
		checkReactionRoles(client);
	} catch (error) {
		report.fail("unexpected error", error.message);
	} finally {
		await client.destroy();
	}
	return report.finish(client.user?.tag);
}

main().then(code => { process.exitCode = code; });
