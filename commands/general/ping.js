const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Bot's Ping"),
	async execute(interaction) {
		// 1. Initial reply to establish the benchmark timestamp.
		// fetchReply: true forces Discord to return the full message payload back to us.
		const sent = await interaction.reply({
			content: "Calculating latency...",
			fetchReply: true,
		}).catch(console.error);

		if (!sent) return;

		// 2. Perform the time-difference math
		const roundTripLatency = sent.createdTimestamp - interaction.createdTimestamp;
		const websocketLatency = interaction.client.ws.ping;

		// 3. Edit the initial response with the actual combined metrics
		await interaction.editReply(
			"🏓 **Pong!**\n" +
			`🤖 **Bot Latency (Round-trip):** \`${roundTripLatency} ms\`\n` +
			`🌐 **WebSocket Latency (Gateway):** \`${websocketLatency} ms\``,
		).catch(console.error);

		// 4. Your 60-second cleanup timer
		setTimeout(() => {
			interaction.deleteReply().catch(() => { /* Absorb error if user deleted it first */ });
		}, 60000);
	},
};
