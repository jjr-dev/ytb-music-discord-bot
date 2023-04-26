const { SlashCommandBuilder } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription("Change music volume")
		.addStringOption((option) =>
			option.setName("volume").setDescription("Music volume").setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply();

		const volume = interaction.options.getString("volume");
		AudioHelp.setVolume({ guild: interaction.guild.id, volume })
			.then((volumes) => {
				interaction.editReply(
					`Volume changed from \`${volumes.from}\` to \`${volumes.to}\``
				);
			})
			.catch((err) => {
				interaction.editReply(err);
			});
	}
};
