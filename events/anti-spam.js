const { Events, PermissionFlagsBits } = require("discord.js");
const AntiSpam = require("discord-anti-spam");
require("dotenv").config();

const antiSpam = new AntiSpam({
	warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
	muteTreshold: 4, // Amount of messages sent in a row that will cause a mute.
	kickTreshold: 7, // Amount of messages sent in a row that will cause a kick.
	banTreshold: 7, // Amount of messages sent in a row that will cause a ban.
	maxInterval: 2000, // Amount of time (ms) in which messages are considered spam.
	maxDuplicatesInterval: 2000, // Amount of time (ms) in which duplicate messages are considered spam.
	maxDuplicatesWarn: 6, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesMute: 10, // Amount of duplicate messages that trigger a mute.
	maxDuplicatesKick: 12, // Amount of duplicate messages that trigger a kick.
	maxDuplicatesBan: 8, // Amount of duplicate messages that trigger a ban.
	modLogsChannel: process.env.logsChannel, // Name or ID of the channel in which moderation logs will be sent.
	modLogsEnabled: true, // Whether moderation logs are enabled.
	modLogsMode: "message", // Whether send moderations logs in an discord embed or normal message! Options: "embed" or "message".
	ignoreBots: true,
	warnMessage: "**{@user}** Stop spamming!", // Message sent in the channel when a user is warned.
	muteMessage: "**{user_tag}** You have been muted for spamming!", // Message sent in the channel when a user is muted.
	kickMessage: "**{user_tag}** You have been kicked for spamming!", // Message sent in the channel when a user is kicked.
	banMessage: "**{user_tag}** You have been banned for spamming!", // Message sent in the channel when a user is banned.
	unMuteTime: 5, // Time in minutes before the user will be able to send messages again.
	verbose: false, // Whether or not to log every action in the console.
	removeMessages: true, // Whether or not to remove all messages sent by the user.
	ignoredPermissions: [ PermissionFlagsBits.Administrator ], // If the user has the following permissions, ignore him.
	// For more options, see the documentation:
});

module.exports = {
	name: Events.MessageCreate,
	description: "Anti-spam",
	once: false,

	async execute(message) {

		antiSpam.message(message);

	},
};
