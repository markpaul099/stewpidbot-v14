const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { Status } = require("discord.js");
const { checkInternetAvailability, isConnectionUnhealthy } = require("../events/watchdog.js");

describe("isConnectionUnhealthy", () => {
	const now = 1_000_000;

	it("flags a disconnected client", () => {
		assert.equal(isConnectionUnhealthy(Status.Disconnected, now, now), true);
	});

	it("flags a ready client with no heartbeat for over 90s", () => {
		assert.equal(isConnectionUnhealthy(Status.Ready, now - 90_001, now), true);
	});

	it("accepts a ready client with a recent heartbeat", () => {
		assert.equal(isConnectionUnhealthy(Status.Ready, now - 90_000, now), false);
		assert.equal(isConnectionUnhealthy(Status.Ready, now - 1_000, now), false);
	});

	it("accepts a ready client that hasn't pinged yet", () => {
		assert.equal(isConnectionUnhealthy(Status.Ready, 0, now), false);
	});

	it("leaves transitional statuses alone", () => {
		for (const status of [Status.Connecting, Status.Reconnecting, Status.Nearly, Status.Identifying, Status.Resuming]) {
			assert.equal(isConnectionUnhealthy(status, now - 200_000, now), false, Status[status]);
		}
	});
});

describe("checkInternetAvailability", () => {
	it("is online when the first target responds", async (t) => {
		const fetch = t.mock.method(globalThis, "fetch", async () => ({ status: 200 }));
		assert.equal(await checkInternetAvailability(), true);
		assert.equal(fetch.mock.callCount(), 1);
		assert.equal(fetch.mock.calls[0].arguments[1].method, "HEAD");
	});

	it("counts an HTTP error status as online", async (t) => {
		t.mock.method(globalThis, "fetch", async () => ({ status: 503 }));
		assert.equal(await checkInternetAvailability(), true);
	});

	it("falls back to the next target on a network error", async (t) => {
		let calls = 0;
		const fetch = t.mock.method(globalThis, "fetch", async () => {
			if (calls++ === 0) throw new TypeError("fetch failed");
			return { status: 200 };
		});
		assert.equal(await checkInternetAvailability(), true);
		assert.equal(fetch.mock.callCount(), 2);
		assert.notEqual(fetch.mock.calls[0].arguments[0], fetch.mock.calls[1].arguments[0]);
	});

	it("is offline when every target fails", async (t) => {
		t.mock.method(globalThis, "fetch", async () => { throw new TypeError("fetch failed"); });
		assert.equal(await checkInternetAvailability(), false);
	});
});
