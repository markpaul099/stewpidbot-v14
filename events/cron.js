const { Events } = require("discord.js");
const { CronJob } = require("cron");
const { ANNOUNCEMENT_CH } = require("../config.json");

module.exports = {
	name: Events.ClientReady,
	once: false,

	async execute(client) {

		console.log("Cron has started!!!");
		const channel = await client.channels.fetch(ANNOUNCEMENT_CH);

		const GW = new CronJob("10 21 * * 4", () => {
			const twntymins = Math.floor(Date.now() / 1000) + 1200;
			channel.send(`@everyone Guild Wars will start <t:${twntymins}:R>`).then(message => {
				setTimeout(async () => {
					await message.edit(`@everyone Guild Wars started <t:${Math.floor(Date.now() / 1000)}:R>`);
				}, 20 * 60000);
			});
		});

		GW.start();

		const CF = new CronJob("40 20 * * 6", () => {
			const twntymins = Math.floor(Date.now() / 1000) + 1200;
			channel.send(`@everyone Capture Flag will start <t:${twntymins}:R>`).then(message => {
				setTimeout(async () => {
					await message.edit(`@everyone Capture Flag started <t:${Math.floor(Date.now() / 1000)}:R>`);
				}, 20 * 60000);
			});
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