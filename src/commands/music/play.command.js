const { SlashCommandBuilder } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play music")
		.addStringOption((option) =>
			option.setName("music").setDescription("Music Category or URL")
		),
	async execute(interaction) {
		await interaction.deferReply();

		const music = interaction.options.getString("music");

		if (!music) {
			await AudioHelp.unpauseAudio({ guild: interaction.guild.id })
				.then(() => {
					interaction.editReply(`Unpaused music`);
				})
				.catch((err) => {
					interaction.editReply(err);
				});

			return;
		}

		AudioHelp.playAudio({ music, interaction })
			.then((data) => {
				const { video, added } = data;

				const embed = AudioHelp.createEmbedPlayer({ video, added, interaction });

				interaction.editReply({
					embeds: [embed]
				});
			})
			.catch((err) => {
				interaction.editReply(err);
			});
	}
};
