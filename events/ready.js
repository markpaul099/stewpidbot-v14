const { Events, ActivityType } = require("discord.js");
const Levels = require("@markpaul099/discord-xp");

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
--------------------Bot by markpaul-------------------
------------------------------------------------------
------------------------------------------------------
`);

		// Set Bot's Pressence/Activity
		setInterval(() => {
			const list = [
				{ type: ActivityType.Watching, name: "for /help" },
				{ type: ActivityType.Watching, name: `Servers: ${client.guilds.cache.size}` },
				{ type: ActivityType.Watching, name: `Users: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}` },
			];
			const index = Math.floor(Math.random() * list.length);
			client.user.setPresence({ activities: [{ name: list[index].name, type: list[index].type }], status: "online" });
		}, 10000);


		// Set Mongo URL
		Levels.setURL(process.env.mongoUrl);

	},
};
