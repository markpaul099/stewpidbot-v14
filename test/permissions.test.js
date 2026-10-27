const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { MessageFlags } = require("discord.js");
const { isBotOwner, requireOwner, moderationBlocker } = require("../utils/permissions.js");

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

describe("moderationBlocker", () => {
	const GUILD_OWNER = "owner";
	const BOT = "bot";

	function makeMember(id, position) {
		return { id, displayName: `user-${id}`, roles: { highest: { position } } };
	}

	function makeInteraction({ moderatorId = "mod", moderatorPosition = 5, botPosition = 10 } = {}) {
		const moderator = makeMember(moderatorId, moderatorPosition);
		return {
			user: { id: moderatorId },
			member: moderator,
			client: { user: { id: BOT } },
			guild: { ownerId: GUILD_OWNER, members: { me: makeMember(BOT, botPosition) } },
		};
	}

	it("allows a target below both the moderator and the bot", () => {
		assert.equal(moderationBlocker(makeInteraction(), makeMember("t", 1), "ban"), null);
	});

	it("blocks targeting yourself, the bot or the server owner", () => {
		const interaction = makeInteraction();
		assert.match(moderationBlocker(interaction, makeMember("mod", 1), "ban"), /yourself/);
		assert.match(moderationBlocker(interaction, makeMember(BOT, 1), "ban"), /myself/);
		assert.match(moderationBlocker(interaction, makeMember(GUILD_OWNER, 1), "ban"), /server owner/);
	});

	it("blocks a target with an equal or higher role than the moderator", () => {
		assert.match(moderationBlocker(makeInteraction(), makeMember("t", 5), "kick"), /You can't kick user-t/);
	});

	it("lets the server owner act regardless of their roles", () => {
		const interaction = makeInteraction({ moderatorId: GUILD_OWNER, moderatorPosition: 0 });
		assert.equal(moderationBlocker(interaction, makeMember("t", 5), "kick"), null);
	});

	it("blocks a target at or above the bot's highest role", () => {
		const interaction = makeInteraction({ moderatorId: GUILD_OWNER, botPosition: 5 });
		assert.match(moderationBlocker(interaction, makeMember("t", 5), "ban"), /I can't ban/);
	});
});
