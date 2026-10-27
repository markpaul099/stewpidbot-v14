const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { Collection } = require("discord.js");
const { parsePollAnswers } = require("../commands/general/poll.js");
const { formatRoles } = require("../commands/general/userinfo.js");

describe("parsePollAnswers", () => {
	it("splits and trims answers", () => {
		assert.deepEqual(parsePollAnswers(" Pizza |Tacos| Sushi "), { answers: ["Pizza", "Tacos", "Sushi"] });
	});

	it("ignores empty answers", () => {
		assert.deepEqual(parsePollAnswers("Yes || No |"), { answers: ["Yes", "No"] });
	});

	it("needs at least two answers", () => {
		assert.ok(parsePollAnswers("Only one").error);
		assert.ok(parsePollAnswers(" | ").error);
	});

	it("allows at most ten answers", () => {
		const ten = Array.from({ length: 10 }, (_, i) => `A${i}`).join("|");
		assert.equal(parsePollAnswers(ten).answers.length, 10);
		assert.ok(parsePollAnswers(`${ten}|A10`).error);
	});

	it("rejects answers over 55 characters", () => {
		assert.ok(parsePollAnswers(`ok | ${"x".repeat(55)}`).answers);
		assert.match(parsePollAnswers(`ok | ${"x".repeat(56)}`).error, /at most 55/);
	});

	it("rejects duplicate answers, ignoring case", () => {
		assert.ok(parsePollAnswers("Yes | yes").error);
	});
});

describe("formatRoles", () => {
	const GUILD_ID = "1";

	function makeMember(roleCount) {
		const roles = [{ id: GUILD_ID, position: 0, toString: () => "@everyone" }];
		for (let i = 1; i <= roleCount; i++) {
			const id = String(100000000000000000n + BigInt(i));
			roles.push({ id, position: i, toString: () => `<@&${id}>` });
		}
		return { guild: { id: GUILD_ID }, roles: { cache: new Collection(roles.map(r => [r.id, r])) } };
	}

	it("says None when the member only has @everyone", () => {
		assert.equal(formatRoles(makeMember(0)), "None");
	});

	it("lists roles highest first and skips @everyone", () => {
		const text = formatRoles(makeMember(3));
		assert.equal(text, "<@&100000000000000003> <@&100000000000000002> <@&100000000000000001>");
	});

	it("stays within the embed field limit and counts what was left out", () => {
		const text = formatRoles(makeMember(100));
		assert.ok(text.length <= 1024, `length ${text.length}`);
		const shown = text.match(/<@&\d+>/g).length;
		assert.match(text, new RegExp(` and ${100 - shown} more$`));
	});
});
