const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
	name: Events.GuildMemberRemove,
	once: false,
	async execute(member) {
		if (member.client.guilds.cache.get(member.guild.id)) {

			// Ignore Bot
			if (member.user.bot) return;

			// LOGS' Channel
			const logsChannel = await member.guild.channels.cache.find(channel => channel.name === process.env.logsChannel);

			// Create Embed
			const embed = new EmbedBuilder()
				.setColor("#152739")
				.setAuthor({ name: `${member.displayName}`, iconURL: member.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
				.setDescription(`${member.displayName}` + " Just left the Sever")
				.setImage(member.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }))
				.setTimestamp()
				.setFooter({ text: `${member.client.user.username} Bot`, iconURL: member.client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) });

			// Send Message
			logsChannel.send({ embeds: [embed] });
		}
	},
};
