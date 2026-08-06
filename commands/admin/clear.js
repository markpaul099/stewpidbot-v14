const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear a specific amount of messages from a user or channel")
		.addIntegerOption(option =>
			option
				.setName("amount")
				.setDescription("Amount of message to be cleared.")
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(99))
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("Select a user to clear their message")
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true });
			const amount = interaction.options.getInteger("amount");
			const user = interaction.options.getUser("user");

			const messages = await interaction.channel.messages.fetch({
				limit: amount + 1,
			});

			const result = new EmbedBuilder()
				.setColor("#2B65EC");

			if (user) {
				let i = 0;
				const filtered = [];

				(await messages).filter((msg) => {
					if (msg.author.id === user.id && amount > i) {
						filtered.push(msg);
						i++;
					}
				});

				await interaction.channel.bulkDelete(filtered).then(messages => {
					result.setDescription(`Succesfully deleted ${messages.size} messages from ${user}.`);
					interaction.editReply({ embeds: [result] });
					setTimeout(() => interaction.deleteReply(), 5000);
				});
			} else {
				await interaction.channel.bulkDelete(amount, true).then(messages => {
					result.setDescription(`Succesfully deleted ${messages.size} messages from the channel.`);
					interaction.editReply({ embeds: [result] });
					setTimeout(() => interaction.deleteReply(), 5000);
				});
			}
		} catch (error) {
			console.error("Error in clear command:", error);
			const errorMessage = "An error occurred while clearing messages. Please try again.";
			if (interaction.deferred) {
				await interaction.editReply(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
			setTimeout(() => interaction.deleteReply(), 10000);
		}
	},
};