const { SlashCommandBuilder } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");

module.exports = {
	data: new SlashCommandBuilder().setName("pause").setDescription("Pause music"),
	async execute(interaction) {
		await interaction.deferReply();

		AudioHelp.pauseAudio({ guild: interaction.guild.id })
			.then(() => {
				interaction.editReply(`Paused music`);
			})
			.catch((err) => {
				interaction.editReply(err);
			});
	}
};
