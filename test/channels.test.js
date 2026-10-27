const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { ChannelType, Collection, MessageFlags } = require("discord.js");
const { findChannel, inCommandChannel } = require("../utils/channels.js");

function makeGuild(channels) {
	return { channels: { cache: new Collection(channels.map(c => [c.id, c])) } };
}

const commands = { id: "1", name: "commands", type: ChannelType.GuildText };
const voiceCommands = { id: "2", name: "commands", type: ChannelType.GuildVoice };
const general = { id: "3", name: "general", type: ChannelType.GuildText };

describe("findChannel", () => {
	it("returns null without a guild or name", () => {
		assert.equal(findChannel(null, "commands"), null);
		assert.equal(findChannel(makeGuild([commands]), undefined), null);
	});

	it("finds a text channel by name", () => {
		assert.equal(findChannel(makeGuild([general, commands]), "commands"), commands);
	});

	it("ignores non-text channels with the same name", () => {
		assert.equal(findChannel(makeGuild([voiceCommands]), "commands"), null);
		assert.equal(findChannel(makeGuild([voiceCommands, commands]), "commands"), commands);
	});

	it("returns null when no channel matches", () => {
		assert.equal(findChannel(makeGuild([general]), "commands"), null);
	});
});

describe("inCommandChannel", () => {
	let savedEnv;

	beforeEach(() => {
		savedEnv = process.env.commandChannel;
		process.env.commandChannel = "commands";
	});

	afterEach(() => {
		if (savedEnv === undefined) delete process.env.commandChannel;
		else process.env.commandChannel = savedEnv;
	});

	function makeInteraction(channelId, channels = [general, commands]) {
		const replies = [];
		let deleted = 0;
		return {
			guild: makeGuild(channels),
			channelId,
			replies,
			get deleted() { return deleted; },
			async reply(payload) { replies.push(payload); },
			async deleteReply() { deleted++; },
		};
	}

	it("allows any channel when the server has no commands channel", async () => {
		const interaction = makeInteraction(general.id, [general]);
		assert.equal(await inCommandChannel(interaction), true);
		assert.equal(interaction.replies.length, 0);
	});

	it("allows the commands channel", async () => {
		const interaction = makeInteraction(commands.id);
		assert.equal(await inCommandChannel(interaction), true);
		assert.equal(interaction.replies.length, 0);
	});

	it("rejects other channels with an ephemeral pointer that deletes itself", async (t) => {
		t.mock.timers.enable({ apis: ["setTimeout"] });
		const interaction = makeInteraction(general.id);

		assert.equal(await inCommandChannel(interaction, "music commands"), false);
		assert.equal(interaction.replies.length, 1);
		assert.equal(interaction.replies[0].content, `use ${commands} for music commands`);
		assert.deepEqual(interaction.replies[0].flags, [MessageFlags.Ephemeral]);

		assert.equal(interaction.deleted, 0);
		t.mock.timers.tick(5000);
		assert.equal(interaction.deleted, 1);
	});
});
