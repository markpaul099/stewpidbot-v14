const { Events } = require("discord.js");
const { CronJob } = require("cron");
const { ANNOUNCEMENT_CH } = require("../config.json");

module.exports = {
	name: Events.ClientReady,
	once: false,

	async execute(client) {

		console.log("Cron has started!!!");
		const channel = await client.channels.fetch(ANNOUNCEMENT_CH);
		const twntymins = Math.floor(Date.now() / 1000) + 1200;

		const GW = new CronJob("10 21 * * 4", () => {
			channel.send(`@everyone Guild Wars will start <t:${twntymins}:R>`);
		});

		GW.start();

		const CF = new CronJob("40 20 * * 6", () => {
			channel.send(`@everyone Capture Flag will start <t:${twntymins}:R>`);
		});

		CF.start();


		// * * * * * *
		// | | | | | |
		// | | | | | day of week
		// | | | | month
		// | | | day of month
		// | | hour
		// | minute
		// second ( optional )

	},
};