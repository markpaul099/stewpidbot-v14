const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { MessageFlags } = require("discord.js");
const { isBotOwner, requireOwner } = require("../utils/permissions.js");

const OWNER_ID = "42";

describe("owner checks", () => {
	let savedEnv;

	beforeEach(() => {
		savedEnv = process.env.botOwnerId;
		process.env.botOwnerId = OWNER_ID;
	});

	afterEach(() => {
		if (savedEnv === undefined) delete process.env.botOwnerId;
		else process.env.botOwnerId = savedEnv;
	});

	function makeInteraction(userId) {
		const replies = [];
		return {
			user: { id: userId },
			replies,
			async reply(payload) { replies.push(payload); },
			async deleteReply() { /* Not needed */ },
		};
	}

	it("isBotOwner matches only the configured owner", () => {
		assert.equal(isBotOwner({ id: OWNER_ID }), true);
		assert.equal(isBotOwner({ id: "7" }), false);
		assert.equal(isBotOwner(undefined), false);
	});

	it("isBotOwner is false for everyone when no owner is configured", () => {
		delete process.env.botOwnerId;
		assert.equal(isBotOwner({ id: undefined }), false);
		assert.equal(isBotOwner({ id: OWNER_ID }), false);
	});

	it("requireOwner lets the owner through silently", async () => {
		const interaction = makeInteraction(OWNER_ID);
		assert.equal(await requireOwner(interaction), true);
		assert.equal(interaction.replies.length, 0);
	});

	it("requireOwner rejects others with an ephemeral reply", async (t) => {
		t.mock.timers.enable({ apis: ["setTimeout"] });
		const interaction = makeInteraction("7");
		assert.equal(await requireOwner(interaction), false);
		assert.equal(interaction.replies.length, 1);
		assert.deepEqual(interaction.replies[0].flags, [MessageFlags.Ephemeral]);
	});
});
