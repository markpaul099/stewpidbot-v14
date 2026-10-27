const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { formatDuration } = require("../utils/format.js");

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatDuration", () => {
	it("shows every unit for long durations", () => {
		assert.equal(formatDuration(2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND), "2 days, 3 hrs, 4 mins, 5 secs");
	});

	it("drops leading zero units but keeps inner ones", () => {
		assert.equal(formatDuration(5 * MINUTE + 3 * SECOND), "5 mins, 3 secs");
		assert.equal(formatDuration(DAY + 5 * SECOND), "1 days, 0 hrs, 0 mins, 5 secs");
	});

	it("rounds down to whole seconds", () => {
		assert.equal(formatDuration(1999), "1 secs");
	});

	it("shows zero seconds for zero or negative input", () => {
		assert.equal(formatDuration(0), "0 secs");
		assert.equal(formatDuration(-500), "0 secs");
	});
});
