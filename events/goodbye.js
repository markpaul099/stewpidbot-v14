const { Events, EmbedBuilder } = require("discord.js");
const { GUILD_ID, LOGS_CH } = require("../config.json");

module.exports = {
	name: Events.GuildMemberRemove,
	once: false,
	execute(member) {
		if (member.client.guilds.cache.get(GUILD_ID)) {

			// Ignore Bot
			if (member.user.bot) return;

			// LOGS' Channel
			const logsChannel = member.guild.channels.cache.get(LOGS_CH);

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
