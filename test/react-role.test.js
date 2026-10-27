const { describe, it, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const networkState = require("../networkState.js");
const { normalizeReaction, findRoleId, handleReaction } = require("../events/react-role.js");

const MESSAGE_ID = "100";

const config = [
	{ messageId: MESSAGE_ID, key: "✅", roleId: "role-check" },
	{ messageId: MESSAGE_ID, key: "555", roleId: "role-custom" },
	{ messageId: MESSAGE_ID, key: "party", roleId: "role-party-name" },
	{ messageId: "200", key: "🔔", roleId: "role-other-message" },
];

function makeReaction({ id = null, name = "✅", messageId = MESSAGE_ID, guild, partial = false } = {}) {
	return {
		emoji: { id, name },
		message: { id: messageId, guild },
		partial,
		fetched: 0,
		async fetch() { this.fetched++; },
	};
}

function makeGuild() {
	const calls = [];
	const member = {
		roles: {
			async add(roleId) { calls.push(["add", roleId]); },
			async remove(roleId) { calls.push(["remove", roleId]); },
		},
	};
	return {
		calls,
		members: { async fetch() { return member; } },
	};
}

describe("normalizeReaction", () => {
	it("keeps unicode emoji as is", () => {
		assert.equal(normalizeReaction("✅"), "✅");
	});

	it("keeps a custom emoji id as is", () => {
		assert.equal(normalizeReaction("123456789"), "123456789");
		assert.equal(normalizeReaction(123456789), "123456789");
	});

	it("extracts the id from custom emoji strings", () => {
		assert.equal(normalizeReaction("<:party:123456789>"), "123456789");
		assert.equal(normalizeReaction("<a:party:123456789>"), "123456789");
	});
});

describe("findRoleId", () => {
	it("matches unicode emoji by name", () => {
		assert.equal(findRoleId(config, makeReaction({ name: "✅" })), "role-check");
	});

	it("matches custom emoji by id", () => {
		assert.equal(findRoleId(config, makeReaction({ id: "555", name: "whatever" })), "role-custom");
	});

	it("falls back to the custom emoji name", () => {
		assert.equal(findRoleId(config, makeReaction({ id: "999", name: "party" })), "role-party-name");
	});

	it("prefers the id over the name", () => {
		assert.equal(findRoleId(config, makeReaction({ id: "555", name: "party" })), "role-custom");
	});

	it("only matches entries for the reacted message", () => {
		assert.equal(findRoleId(config, makeReaction({ name: "🔔" })), null);
		assert.equal(findRoleId(config, makeReaction({ name: "✅", messageId: "200" })), null);
	});
});

describe("handleReaction", () => {
	afterEach(() => {
		networkState.isInternetDown = false;
	});

	const user = { id: "u1", bot: false, partial: false };

	it("adds the role on add", async () => {
		const guild = makeGuild();
		await handleReaction(config, makeReaction({ guild }), user, "add");
		assert.deepEqual(guild.calls, [["add", "role-check"]]);
	});

	it("removes the role on remove", async () => {
		const guild = makeGuild();
		await handleReaction(config, makeReaction({ guild }), user, "remove");
		assert.deepEqual(guild.calls, [["remove", "role-check"]]);
	});

	it("ignores bots", async () => {
		const guild = makeGuild();
		await handleReaction(config, makeReaction({ guild }), { ...user, bot: true }, "add");
		assert.deepEqual(guild.calls, []);
	});

	it("ignores reactions with no configured role", async () => {
		const guild = makeGuild();
		await handleReaction(config, makeReaction({ guild, name: "❌" }), user, "add");
		assert.deepEqual(guild.calls, []);
	});

	it("ignores reactions outside a guild", async () => {
		await assert.doesNotReject(handleReaction(config, makeReaction({ guild: null }), user, "add"));
	});

	it("does nothing while the internet is down", async () => {
		networkState.isInternetDown = true;
		const guild = makeGuild();
		await handleReaction(config, makeReaction({ guild }), user, "add");
		assert.deepEqual(guild.calls, []);
	});

	it("fetches partials before checking the bot flag", async () => {
		const guild = makeGuild();
		const reaction = makeReaction({ guild, partial: true });
		const partialUser = {
			id: "u2",
			partial: true,
			async fetch() { this.bot = true; },
		};
		await handleReaction(config, reaction, partialUser, "add");
		assert.equal(reaction.fetched, 1);
		assert.deepEqual(guild.calls, []);
	});

	it("logs and stops when fetching a partial fails", async (t) => {
		const error = t.mock.method(console, "error", () => { /* Silence */ });
		const guild = makeGuild();
		const reaction = makeReaction({ guild, partial: true });
		reaction.fetch = async () => { throw new Error("Unknown Message"); };

		await handleReaction(config, reaction, user, "add");
		assert.deepEqual(guild.calls, []);
		assert.equal(error.mock.callCount(), 1);
	});

	it("logs role errors instead of throwing", async (t) => {
		const error = t.mock.method(console, "error", () => { /* Silence */ });
		const guild = makeGuild();
		guild.members.fetch = async () => { throw new Error("Unknown Member"); };

		await assert.doesNotReject(handleReaction(config, makeReaction({ guild }), user, "add"));
		assert.equal(error.mock.callCount(), 1);
	});
});
