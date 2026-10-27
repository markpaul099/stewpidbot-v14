const { Events, Status } = require("discord.js");
const networkState = require("../networkState.js");
const connectivityTargets = ["https://discord.com/api/v10/gateway", "https://1.1.1.1"];
const MAX_SILENCE_TIME = 90 * 1000;

// Disconnected, or Ready but no heartbeat for too long
function isConnectionUnhealthy(status, lastPingTimestamp, now = Date.now()) {
	const isDisconnected = status === Status.Disconnected;
	const isFrozen = status === Status.Ready && lastPingTimestamp > 0 && now - lastPingTimestamp > MAX_SILENCE_TIME;
	return isDisconnected || isFrozen;
}

// Any HTTP response (even 4xx/5xx) means we reached the internet; only network errors or timeouts count as offline
async function checkInternetAvailability() {
	for (const url of connectivityTargets) {
		try {
			await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
			return true;
		} catch {
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

		const watchdogInterval = setInterval(async () => {
			if (networkState.isInternetDown) return;

			const status = client.ws.status;
			const shard = client.ws.shards.first();
			const currentPingTimestamp = shard?.lastPingTimestamp || 0;
			const timeSinceLastPing = Date.now() - currentPingTimestamp;

			if (isConnectionUnhealthy(status, currentPingTimestamp)) {
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
					} catch {
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

	// Exposed for tests
	checkInternetAvailability,
	isConnectionUnhealthy,
};

function forceRestart(client) {
	try { client.destroy(); } catch { /* Catch */ }
	console.log("[Watchdog] Killing process for PM2 restart...");
	process.exit(1);
}
