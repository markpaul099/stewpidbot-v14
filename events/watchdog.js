const { Events } = require("discord.js");
const ping = require("ping");
const networkState = require("../networkState.js");
const fallbackIPs = ["1.1.1.1", "8.8.8.8", "9.9.9.9"];

async function checkInternetAvailability() {
	for (const ip of fallbackIPs) {
		try {
			const res = await ping.promise.probe(ip, { timeout: 3 });
			if (res.alive) return true;
		} catch (e) {
			// Drop through silently
		}
	}
	return false;
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log("[Watchdog] Modular file active. Monitoring connection health...");

		const CHECK_INTERVAL = 30 * 1000;
		const MAX_SILENCE_TIME = 90 * 1000;

		const watchdogInterval = setInterval(async () => {
			if (networkState.isInternetDown) return;

			const status = client.ws.status;
			const shard = client.ws.shards.first();
			const currentPingTimestamp = shard?.lastPingTimestamp || 0;
			const timeSinceLastPing = Date.now() - currentPingTimestamp;

			const isDisconnected = status === 4; // Status.Disconnected is 4
			const isFrozen = status === 0 && currentPingTimestamp > 0 && timeSinceLastPing > MAX_SILENCE_TIME;

			if (isDisconnected || isFrozen) {
				console.error(`[Watchdog] Network issue caught (Status Code: ${status}, Last Ping Age: ${timeSinceLastPing}ms).`);

				// Flip flag to tell ready.js presence timer to instantly stop looping!
				networkState.isInternetDown = true;

				const isOnline = await checkInternetAvailability();

				if (isOnline) {
					console.error("[Watchdog] Internet is active. Client socket itself is zombied. Restarting thread...");
					clearInterval(watchdogInterval);
					forceRestart(client);
				} else {
					console.warn("[Watchdog] ISP connectivity lost. Safely unloading active client instances...");

					try {
						await client.destroy();
					} catch (e) {
						/* Ignore active socket teardown errors */
					}

					const recoveryInterval = setInterval(async () => {
						console.log("[Watchdog Recovery] Testing infrastructure targets...");
						const networkRestored = await checkInternetAvailability();

						if (networkRestored) {
							console.log("[Watchdog Recovery] Connection restored! Exiting process for PM2 reboot.");
							clearInterval(recoveryInterval);
							clearInterval(watchdogInterval);
							process.exit(1);
						}
					}, 30000);
				}
			}
		}, CHECK_INTERVAL);
	},
};

function forceRestart(client) {
	try { client.destroy(); } catch (e) { /* Catch */ }
	console.log("[Watchdog] Killing process for PM2 restart...");
	process.exit(1);
}
