const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const { GUILD_ID, MONGO_URL } = require("../config.json");
const Levels = require("@markpaul099/discord-xp");
const { Player } = require("discord-player");

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`
------------------------------------------------------
> Logging in...
------------------------------------------------------
Logged in as ${client.user.tag}
Working on ${client.guilds.cache.size} servers!
${client.channels.cache.size} channels and ${client.users.cache.size} users cached!
------------------------------------------------------
------------------------------------------------------
-----------------Bot by Tomohiro#6331-----------------
------------------------------------------------------
------------------------------------------------------
`);
		// Set Bot's Pressence/Activity
		const guild = client.guilds.cache.get(GUILD_ID);
		const memberCount = guild.members.cache.filter(member => !member.user.bot).size;
		const list = [
			{ type: ActivityType.Watching, name: "for /help" },
			{ type: ActivityType.Watching, name: `Members: ${memberCount}` },
		];
		setInterval(() => {
			const index = Math.floor(Math.random() * list.length);
			client.user.setPresence({ activities: [{ name: list[index].name, type: list[index].type }], status: "online" });
		}, 10000);

		// Set Mongo URL
		Levels.setURL(MONGO_URL);

		// Set Player
		const player = new Player(client, {
			ytdlOptions: {
				quality: "highestaudio",
				highWaterMark: 1 << 25,
			},
			autoRegisterExtractor: false,
		});

		await player.extractors.loadDefault();

		player.events.on("playerStart", (queue, track) => {
			const embed = new EmbedBuilder()
				.setColor("#152739")
				.setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 2048, extension: "png" }) })
				.setTitle("Now Playing")
				.setDescription(`**[${track.title}](${track.url})**\nRequested by: ${track.requestedBy}\nDuration: ${track.duration}`)
				.setThumbnail(`${track.thumbnail}`);
			// we will later define queue.metadata object while creating the queue
			queue.metadata.channel.send({ embeds: [embed] });
		});

		player.events.on("playerSkip", (queue, track) => {
			queue.metadata.channel.send(`Skipping **${track.title}** due to an issue`);
		});

		player.events.on("emptyChannel", queue => {
			queue.metadata.channel.send("Voice channel is empty, disconnecting...");
		});
	},
};
