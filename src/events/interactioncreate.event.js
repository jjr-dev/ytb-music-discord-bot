const { Events } = require("discord.js");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const command = interaction.client.commands.get(interaction.commandName);

		if ((interaction.isChatInputCommand() || interaction.isAutocomplete()) && !command) {
			console.log(`[ERRO] Command ${interaction.commandName} not found`);
			return;
		}

		try {
			if (interaction.isChatInputCommand()) await command.execute(interaction);
			else if (interaction.isAutocomplete()) await command.autocomplete(interaction);
		} catch (err) {
			console.log(err);

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "An error occurred while executing this command",
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: "An error occurred while executing this command",
					ephemeral: true
				});
			}
		}
	}
};
