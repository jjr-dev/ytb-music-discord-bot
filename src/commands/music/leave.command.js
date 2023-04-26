const { SlashCommandBuilder } = require("discord.js");
const AudioHelp = require("../../helpers/audio.helper");

module.exports = {
	data: new SlashCommandBuilder().setName("leave").setDescription("Stop playing music"),
	async execute(interaction) {
		await interaction.deferReply();

		AudioHelp.leaveAudio(interaction.guild.id)
			.then(() => {
				interaction.editReply(`Finished song`);
			})
			.catch((err) => {
				interaction.editReply(err);
			});
	}
};
