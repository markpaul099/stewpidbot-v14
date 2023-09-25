const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const Levels = require("@markpaul099/discord-xp");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Guild's Leaderboard"),
	async execute(interaction) {
		await interaction.deferReply();
		await wait(2000);
		// We grab top 10 users with most xp in the current server.
		const rawLeaderboard = await Levels.fetchLeaderboard(interaction.guild.id, 10);

		// Check if leaderboard is empty
		if (rawLeaderboard.length < 1) {
			return interaction.editReply("Nobody's in leaderboard yet.")
				.then(() => setTimeout(() =>
					interaction.deleteReply(), 10000));
		}

		// We process the leaderboard.
		const leaderboard = await Levels.computeLeaderboard(interaction.client, rawLeaderboard, true);

		// We map the outputs.
		const lb = leaderboard.map(e => {
			if (!e.nickname && e.discriminator == "0") {
				return `${e.position}. **${e.username}**\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`;
			} else if (!e.nickname && e.discriminator !== "0") {
				return `${e.position}. **${e.username}#${e.discriminator}**\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`;
			} else if (e.nickname && e.discriminator !== "0") {
				return `${e.position}. **${e.nickname}**\n${e.username}#${e.discriminator}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`;
			} else if (e.nickname && e.discriminator == "0") {
				return `${e.position}. **${e.nickname}**\n@${e.username}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`;
			}
		});

		// WE create Embed for leaderboard
		const embed = new EmbedBuilder()
			.setTitle("**Leaderboard**")
			.setDescription(`${lb.join("\n\n")}`)
			.setColor("#2B65EC")
			.setTimestamp()
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true, extension: "png" }) });

		// Send Embed
		interaction.editReply({ embeds: [embed] });
	},
};