const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const canvacord = require("canvacord");
const Levels = require("@markpaul099/discord-xp");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("Member's Level")
		.addUserOption(option =>
			option
				.setName("member")
				.setDescription("Choose a Member")),
	async execute(interaction) {

		const cmdChannel = await interaction.guild.channels.cache.find(channel => channel.name === "bot-commands");
		if (cmdChannel.id !== interaction.channel.id) {
			interaction.editReply(
				`use ${cmdChannel} for level commands`,
			);
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
			return;
		}

		await interaction.deferReply();
		await wait(2000);
		// Grab the target user.
		const target = interaction.options.getUser("member") || interaction.user;

		// Selects the target from the database.
		const user = await Levels.fetch(target.id, interaction.guild.id, true);
		const name = await interaction.client.guilds.cache.get(interaction.guild.id).members.cache.get(target.id);
		// If there isnt such user in the database or if the user is bot
		if (target.bot) {
			return interaction.editReply("Bot's don't get xp")
				.then(() => setTimeout(() =>
					interaction.deleteReply(), 10000));
		}
		if (!user) {
			return interaction.editReply("Seems like this user has not earned any xp so far.")
				.then(() => setTimeout(() =>
					interaction.deleteReply(), 10000));
		}
		// Create canva for rank
		const rank = new canvacord.Rank() // Build the Rank Card
			.setAvatar(target.displayAvatarURL({ dynamic: true, extension: "png", size: 512 }))
			.setCurrentXP(user.cleanXp) // Current User Xp
			.setRequiredXP(user.cleanNextLevelXp) // We calculate the required Xp for the next level
			.setRank(user.position) // Position of the user on the leaderboard
			.setLevel(user.level) // Current Level of the user
			.setProgressBar("#2B65EC");

		if (!name.nickname && target.discriminator == "0") {
			rank
				.setUsername(target.username)
				.setDiscriminator(target.username);
			console.log("option 1");
		} else if (!name.nickname && target.discriminator !== "0") {
			rank
				.setUsername(target.username)
				.setDiscriminator(target.discriminator);
			console.log("option 2");
		} else if (name.nickname && target.discriminator !== "0") {
			rank
				.renderEmojis(true)
				.setUsername(name.nickname)
				.setDiscriminator(target.discriminator);
			console.log("option 3");
		} else if (name.nickname && target.discriminator == "0") {
			rank
				.renderEmojis(true)
				.setUsername(name.nickname)
				.setDiscriminator(target.username);
			console.log("option 4");
		}
		console.log(target);
		// Send Attachement
		rank.build()
			.then(buffer => {
				const attachment = new AttachmentBuilder(buffer, { name: `${interaction.guild.name}-RankCard.png` });
				interaction.editReply({ files: [attachment] });
			});
	},
};