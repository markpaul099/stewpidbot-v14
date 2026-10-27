const { SlashCommandBuilder, MessageFlags } = require("discord.js");

// Discord poll limits
const MAX_ANSWERS = 10;
const MAX_ANSWER_LENGTH = 55;

// Splits "Pizza | Tacos | Sushi" into answers. Returns { answers } or { error }.
function parsePollAnswers(input) {
	const answers = input.split("|").map(answer => answer.trim()).filter(Boolean);

	if (answers.length < 2) return { error: "Give at least 2 answers, separated by `|`." };
	if (answers.length > MAX_ANSWERS) return { error: `A poll can have at most ${MAX_ANSWERS} answers.` };

	const tooLong = answers.find(answer => answer.length > MAX_ANSWER_LENGTH);
	if (tooLong) return { error: `Answers can be at most ${MAX_ANSWER_LENGTH} characters: "${tooLong}"` };

	const seen = new Set(answers.map(answer => answer.toLowerCase()));
	if (seen.size !== answers.length) return { error: "Each answer must be different." };

	return { answers };
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Start a poll")
		.addStringOption(option =>
			option
				.setName("question")
				.setDescription("What to ask")
				.setRequired(true)
				.setMaxLength(300))
		.addStringOption(option =>
			option
				.setName("answers")
				.setDescription("2 to 10 answers separated by | (e.g. Pizza | Tacos | Sushi)")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("hours")
				.setDescription("How long the poll runs (default 24, max 768 = 32 days)")
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(768))
		.addBooleanOption(option =>
			option
				.setName("multiple")
				.setDescription("Allow picking more than one answer")
				.setRequired(false)),

	async execute(interaction) {
		try {
			const { answers, error } = parsePollAnswers(interaction.options.getString("answers"));
			if (error) {
				await interaction.reply({ content: error, flags: [MessageFlags.Ephemeral] });
				setTimeout(() => interaction.deleteReply().catch(() => { /* Catch */ }), 10000);
				return;
			}

			await interaction.reply({
				poll: {
					question: { text: interaction.options.getString("question") },
					answers: answers.map(text => ({ text })),
					duration: interaction.options.getInteger("hours") ?? 24,
					allowMultiselect: interaction.options.getBoolean("multiple") ?? false,
				},
			});
		} catch (error) {
			console.error("Error in poll command:", error);
			const errorMessage = "An error occurred while starting the poll. Please try again.";
			if (interaction.deferred || interaction.replied) {
				await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			} else {
				await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] }).catch(() => { /* Catch */ });
			}
		}
	},

	// Exposed for tests
	parsePollAnswers,
};
