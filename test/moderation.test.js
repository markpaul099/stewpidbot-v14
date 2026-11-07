const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { ChannelType, Collection, PermissionFlagsBits } = require("discord.js");
const ban = require("../commands/admin/ban.js");
const kick = require("../commands/admin/kick.js");
const unban = require("../commands/admin/unban.js");
const timeout = require("../commands/admin/timeout.js");

const GUILD_OWNER = "owner";
const BOT = "bot";
const MOD = "mod";
const TARGET_ID = "123456789012345678";

function makeMember(id, position, { admin = false } = {}) {
	const calls = [];
	return {
		id,
		calls,
		displayName: `user-${id}`,
		roles: { highest: { position } },
		permissions: { has: flag => admin && flag === PermissionFlagsBits.Administrator },
		async kick(reason) { calls.push(["kick", reason]); },
		async timeout(ms, reason) { calls.push(["timeout", ms, reason]); },
	};
}

// Builds a fake interaction. `target` is the member returned by guild.members.fetch, or null if not in the server.
function makeInteraction({ options = {}, target = null, bans = new Map() } = {}) {
	const calls = [];
	const logs = { id: "logs", name: "logs", type: ChannelType.GuildText, sent: [], async send(p) { this.sent.push(p); } };
	return {
		calls,
		logs,
		edits: [],
		deferred: false,
		user: { id: MOD, username: "moderator" },
		member: makeMember(MOD, 5),
		client: { user: { id: BOT } },
		options: {
			getUser: name => options[name],
			getString: name => options[name] ?? null,
			getInteger: name => options[name],
		},
		guild: {
			ownerId: GUILD_OWNER,
			channels: { cache: new Collection([[logs.id, logs]]) },
			bans: { async fetch(id) { if (!bans.has(id)) throw new Error("Unknown Ban"); return bans.get(id); } },
			members: {
				me: makeMember(BOT, 10),
				async fetch() { if (!target) throw new Error("Unknown Member"); return target; },
				async ban(id, opts) { calls.push(["ban", id, opts.reason]); },
				async unban(id, reason) { calls.push(["unban", id, reason]); },
			},
		},
		async deferReply() { this.deferred = true; },
		async editReply(payload) { this.edits.push(payload); },
		async reply(payload) { this.edits.push(payload); },
		async deleteReply() { /* Not needed */ },
	};
}

function replyText(interaction) {
	const last = interaction.edits.at(-1);
	return last.content ?? last.embeds[0].data.description;
}

const targetUser = { id: TARGET_ID, username: "target" };

describe("moderation commands", () => {
	let savedLogs;

	beforeEach((t) => {
		t.mock.timers.enable({ apis: ["setTimeout"] });
		savedLogs = process.env.logsChannel;
		process.env.logsChannel = "logs";
	});

	afterEach(() => {
		if (savedLogs === undefined) delete process.env.logsChannel;
		else process.env.logsChannel = savedLogs;
	});

	describe("ban", () => {
		it("bans a member below the moderator and logs it", async () => {
			const interaction = makeInteraction({ options: { user: targetUser, reason: "spam" }, target: makeMember(TARGET_ID, 1) });
			await ban.execute(interaction);
			assert.deepEqual(interaction.calls, [["ban", TARGET_ID, "spam"]]);
			assert.match(replyText(interaction), /Successfully banned target with reason:\nspam/);
			assert.equal(interaction.logs.sent.length, 1);
		});

		it("bans users who aren't in the server by ID", async () => {
			const interaction = makeInteraction({ options: { user: targetUser } });
			await ban.execute(interaction);
			assert.deepEqual(interaction.calls, [["ban", TARGET_ID, "No reason provided"]]);
		});

		it("refuses a member with an equal or higher role", async () => {
			const interaction = makeInteraction({ options: { user: targetUser }, target: makeMember(TARGET_ID, 5) });
			await ban.execute(interaction);
			assert.deepEqual(interaction.calls, []);
			assert.match(replyText(interaction), /higher or equal role/);
			assert.equal(interaction.logs.sent.length, 0);
		});

		it("reports an error when the ban fails", async (t) => {
			t.mock.method(console, "error", () => { /* Silence */ });
			const interaction = makeInteraction({ options: { user: targetUser } });
			interaction.guild.members.ban = async () => { throw new Error("Missing Permissions"); };
			await ban.execute(interaction);
			assert.match(replyText(interaction), /An error occurred while banning/);
		});
	});

	describe("kick", () => {
		it("kicks a member and logs it", async () => {
			const target = makeMember(TARGET_ID, 1);
			const interaction = makeInteraction({ options: { user: targetUser, reason: "rude" }, target });
			await kick.execute(interaction);
			assert.deepEqual(target.calls, [["kick", "rude"]]);
			assert.match(replyText(interaction), /Successfully kicked user-123456789012345678/);
			assert.equal(interaction.logs.sent.length, 1);
		});

		it("says so when the user isn't in the server", async () => {
			const interaction = makeInteraction({ options: { user: targetUser } });
			await kick.execute(interaction);
			assert.match(replyText(interaction), /target is not in this server/);
		});

		it("refuses to kick the server owner", async () => {
			const target = makeMember(GUILD_OWNER, 1);
			const interaction = makeInteraction({ options: { user: targetUser }, target });
			await kick.execute(interaction);
			assert.deepEqual(target.calls, []);
			assert.match(replyText(interaction), /server owner/);
		});
	});

	describe("unban", () => {
		it("rejects input that isn't a user ID", async () => {
			const interaction = makeInteraction({ options: { userid: "not-an-id" } });
			await unban.execute(interaction);
			assert.deepEqual(interaction.calls, []);
			assert.match(replyText(interaction), /is not a valid user ID/);
		});

		it("says so when the user isn't banned", async () => {
			const interaction = makeInteraction({ options: { userid: TARGET_ID } });
			await unban.execute(interaction);
			assert.deepEqual(interaction.calls, []);
			assert.match(replyText(interaction), /is not banned/);
		});

		it("unbans a banned user, trimming the ID", async () => {
			const bans = new Map([[TARGET_ID, { user: targetUser }]]);
			const interaction = makeInteraction({ options: { userid: ` ${TARGET_ID} ` }, bans });
			await unban.execute(interaction);
			assert.deepEqual(interaction.calls, [["unban", TARGET_ID, "Unbanned by moderator"]]);
			assert.match(replyText(interaction), /Successfully unbanned target/);
			assert.equal(interaction.logs.sent.length, 1);
		});
	});

	describe("timeout", () => {
		it("times out a member for the given minutes", async () => {
			const target = makeMember(TARGET_ID, 1);
			const interaction = makeInteraction({ options: { user: targetUser, minutes: 10, reason: "calm down" }, target });
			await timeout.execute(interaction);
			assert.deepEqual(target.calls, [["timeout", 10 * 60 * 1000, "calm down"]]);
			assert.match(replyText(interaction), /Timed out user-\d+ until/);
		});

		it("removes the timeout when minutes is 0", async () => {
			const target = makeMember(TARGET_ID, 1);
			const interaction = makeInteraction({ options: { user: targetUser, minutes: 0 }, target });
			await timeout.execute(interaction);
			assert.deepEqual(target.calls, [["timeout", null, "No reason provided"]]);
			assert.match(replyText(interaction), /Removed the timeout/);
		});

		it("refuses to time out an administrator", async () => {
			const target = makeMember(TARGET_ID, 1, { admin: true });
			const interaction = makeInteraction({ options: { user: targetUser, minutes: 10 }, target });
			await timeout.execute(interaction);
			assert.deepEqual(target.calls, []);
			assert.match(replyText(interaction), /is an administrator/);
		});
	});
});
