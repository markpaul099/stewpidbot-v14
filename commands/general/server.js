const { SlashCommandBuilder } = require("discord.js");
const moment = require("moment");
const { GUILD_ID, SERVER_OWNER_ID, SERVER_OWNER_NAME } = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Provides information about the server"),
	async execute(interaction) {

		const guild = interaction.client.guilds.cache.get(GUILD_ID);
		const guildmessageServerInfo = interaction.guild;
		const createdAtServerInfo = moment(interaction.guild.createdAt).format("MMMM Do YYYY, h:mm:ss a");
		const channelsServerInfo = interaction.guild.channels.cache.size;
		const memberCountServerInfo = guild.members.cache.filter(member => !member.user.bot).size;
		const botCountServerInfo = guild.members.cache.filter(member => member.user.bot).size;
		const largeServerInfo = interaction.guild.large;
		const afkServerInfo = interaction.guild.channels.cache.get(interaction.guild.afkChannelID) === undefined ? "None" : interaction.guild.channels.cache.get(guildmessageServerInfo.afkChannelID).name;

		const embed = {
			author: {
				name: interaction.guild.name,
				icon_url: interaction.guild.iconURL,
			},
			title: "Server Information",
			fields: [{
				name: "Channels:",
				value: `**Channel Count:** ${channelsServerInfo}\n**AFK Channel:** ${afkServerInfo}`,
			},
			{
				name: "Members:",
				value: `**Member Count:** ${memberCountServerInfo}\n**Bot Count:** ${botCountServerInfo}\n**Owner:** ${SERVER_OWNER_NAME}\n**Owner ID:** ${SERVER_OWNER_ID}`,
			},
			{
				name: "More:",
				value: `**Created at:** ${createdAtServerInfo}\n**Large Guild?:** ${largeServerInfo ? "Yes" : "No"}`,
			},
			],
			timestamp: new Date(),
			footer: {
				icon_url: interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048, format: "png" }),
				text: `© ${interaction.client.user.username} Bot`,
			},
		};
		await interaction.reply({ embeds: [embed] });
		setTimeout(() => interaction.deleteReply(), 60000);
	},
};
