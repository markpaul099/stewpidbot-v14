const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

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
				if (messages.author.id === user.id && amount > i) {
					filtered.push(msg);
					i++;
				}
			});

			await interaction.channel.bulkDelete(filtered).then(messages => {
				result.setDescription(`Succesfully deleted ${messages.size} messages from ${user}.`);
				interaction.reply({ embeds: [result] });
				setTimeout(() => interaction.deleteReply(), 5000);
			});
		} else {
			await interaction.channel.bulkDelete(amount, true).then(messages => {
				result.setDescription(`Succesfully deleted ${messages.size} messages the channel.`);
				interaction.reply({ embeds: [result] });
				setTimeout(() => interaction.deleteReply(), 5000);
			});
		}
	},
};