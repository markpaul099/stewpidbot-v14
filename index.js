// Intercept and swallow internal DNS lookup failures during ISP outages
process.on("unhandledRejection", (error) => {
	// Intercept and swallow internal DNS lookup failures during ISP outages
	if (error?.code === "ENOTFOUND" || error?.code === "EAI_AGAIN") {
		console.warn("[Process Guard] Swallowed background DNS error:", error.message);
		return;
	}
	console.error("[Process Guard] Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
	if (error?.code === "ENOTFOUND" || error?.code === "EAI_AGAIN") {
		console.warn("[Process Guard] Swallowed uncaught DNS exception:", error.message);
		return;
	}
	console.error("[Process Guard] Uncaught Exception:", error);
	process.exit(1);
});

const { Client, Collection, GatewayIntentBits, Partials, Options } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

// Create a new client instance
const client = new Client ({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [
		Partials.User,
		Partials.Message,
		Partials.Reaction,
		Partials.Channel,
		Partials.GuildMember,
	],

	// Cache Sweeper and Manager Options
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		MessageManager: 50, // Only keep the last 50 messages per channel in RAM
		ThreadManager: 20,
		PresenceManager: 0, // Set to 0 if your bot doesn't need to know user statuses (Online/DND)
		ReactionManager: 10,
		ReactionUserManager: 10,
		GuildMemberManager: {
			maxSize: 100,
			keepOverLimit: member => member.id === member.client.user?.id, // Always keep the bot itself cached
		},
	}),

	// WebSocket and REST Options
	ws: {
		closeTimeout: 10000,
	},

	rest: {
		timeout: 15000,
		retries: 3,
	},
});

// Command Handler
client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Event Handler
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Login to Discord with your client's token
client.login(process.env.token);