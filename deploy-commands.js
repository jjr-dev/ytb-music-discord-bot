const { REST, Routes } = require("discord.js");
const { token, client } = require("./configs.json");

const commandsData = [];

const commands = require("./src/helpers/findcommands.helper");

for (const command of commands()) {
	commandsData.push(command.data.toJSON());
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Starting update of ${commandsData.length} command`);

		const data = await rest.put(Routes.applicationCommands(client), {
			body: commandsData
		});

		console.log(`${data.length} commands updated successfully`);
	} catch (err) {
		console.log(err);
	}
})();
