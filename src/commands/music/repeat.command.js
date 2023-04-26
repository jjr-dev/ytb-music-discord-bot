const { SlashCommandBuilder } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");

module.exports = {
	data: new SlashCommandBuilder().setName("repeat").setDescription("Repeat music"),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		AudioHelp.repeatAudio({ guild: interaction.guild.id })
			.then(() => {
				interaction.editReply(`Repeating music`);
			})
			.catch((err) => {
				interaction.editReply(err);
			});
	}
};
