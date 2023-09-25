const { REST, Routes } = require("discord.js");
const { ClientID, token } = require("./config.json");

const rest = new REST({ version: 10 }).setToken(token);

// for global commands
rest.put(Routes.applicationCommands(ClientID), { body: [] })
	.then(() => console.log("Successfully deleted all application commands."))
	.catch(console.error);