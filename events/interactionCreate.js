const { Events, MessageFlags } = require("discord.js");

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		if (!interaction.inGuild()) {
			await interaction.reply({ content: "Commands only work in servers.", flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			return;
		}

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};
