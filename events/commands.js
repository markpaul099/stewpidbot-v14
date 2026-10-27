const { Events, PermissionFlagsBits } = require("discord.js");
const { findChannel } = require("../utils/channels.js");

module.exports = {
	name: Events.MessageCreate,
	description: "commands outside of slash-command",
	once: false,

	async execute(message) {
		if (!message.guild || message.author.bot) return;
		{
			if (message.content.startsWith(`${process.env.prefix}say`)) {
				if (message.author.id == process.env.botOwnerId) {
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
			} else if (message.content.startsWith(`${process.env.prefix}announce`)) {
				const AC = findChannel(message.guild, process.env.newsChannel);
				if (AC && message.member.permissionsIn(AC).has(PermissionFlagsBits.SendMessages)) {
					message.delete();
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
