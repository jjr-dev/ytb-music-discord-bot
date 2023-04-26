const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Get ping from server"),
	async execute(interaction) {
		const client = interaction.client;

		await interaction.reply({
			content: `Pong! \`${client.ws.ping}ms\``,
			ephemeral: true
		});
	}
};
