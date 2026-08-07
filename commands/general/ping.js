const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Checks the bot's connection and latency."),
	async execute(interaction) {
		try {
			const response = await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });

			const roundTripLatency = response.resource.message.createdTimestamp - interaction.createdTimestamp;
			const websocketLatency = interaction.client.ws.ping;

			let pingColor = "Green";
			if (roundTripLatency > 250) pingColor = "Yellow";
			if (roundTripLatency > 500) pingColor = "Red";

			const pingEmbed = new EmbedBuilder()
				.setTitle("🏓 Pong!")
				.setColor(pingColor)
				.addFields(
					{ name: "🤖 Bot Latency", value: `\`${roundTripLatency} ms\``, inline: true },
					{ name: "🌐 Gateway (WS)", value: `\`${websocketLatency} ms\``, inline: true },
				)
				.setTimestamp();

			await interaction.editReply({ embeds: [pingEmbed] });
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 60000);

		} catch (error) {
			console.error("[Ping Command] Failed to execute:", error);

			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: "❌ Could not calculate ping." }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: "❌ Could not calculate ping.", flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
			setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
		}
	},
};