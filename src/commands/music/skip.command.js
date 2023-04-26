const { SlashCommandBuilder } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");

module.exports = {
	data: new SlashCommandBuilder().setName("skip").setDescription("Skip music"),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		AudioHelp.skipAudio({ guild: interaction.guild.id })
			.then(() => {
				interaction.editReply(`Skipping music`);
			})
			.catch((err) => {
				interaction.editReply(err);
			});
	}
};
