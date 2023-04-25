const { Events, PermissionFlagsBits } = require("discord.js");
const { BOT_OWNER_ID, ANNOUNCEMENT_CH, prefix } = require("../config.json");

module.exports = {
	name: Events.MessageCreate,
	description: "commands outside of slash-command",
	once: false,

	async execute(message) {
		{
			if (message.content.startsWith(`${prefix}say`)) {
				if (message.author.id == BOT_OWNER_ID) {
					message.delete();
					let sentence = message.content.split(" ");
					sentence.shift();
					sentence = sentence.join(" ");
					message.channel.send(sentence);
				} else {
					message.delete();
					message.channel.send(`Hey <@${message.author.id}> you lack permission to perform that action.`).then(message => {
						setTimeout(() => message.delete(), 10000);
					});
				}
			} else if (message.content.startsWith(`${prefix}announce`)) {
				if (message.member.permissionsIn(ANNOUNCEMENT_CH).has(PermissionFlagsBits.SendMessages)) {
					message.delete();
					const AC = message.client.channels.cache.get(ANNOUNCEMENT_CH);
					let sentence = message.content.split(" ");
					sentence.shift();
					sentence = sentence.join(" ");
					AC.send(sentence);
				} else {
					message.delete();
					message.channel.send(`Hey <@${message.author.id}> you lack permission to perform this action.`).then(message => {
						setTimeout(() => message.delete(), 10000);
					});
				}
			}
		}
	},
};
