const { SlashCommandBuilder, userMention } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");
const EmbedBuilderHelp = require("../../helpers/embedbuilder.helper");

module.exports = {
	data: new SlashCommandBuilder().setName("queue").setDescription("Music queue"),
	async execute(interaction) {
		await interaction.deferReply();

		const queue = AudioHelp.getQueue(interaction.guild.id);

		if (!queue) {
			interaction.editReply("No song in queue");
			return;
		}

		const songs = [];
		for (const prop in queue) {
			const song = queue[prop];

			let title = song.title;
			if (title.length > 25) title = `${title.substring(0, 25).trim()}...`;

			songs.push(`${parseInt(prop) + 1} - ${title} by ${userMention(song.requester)}`);
		}

		const embed = EmbedBuilderHelp(interaction.client)
			.setTitle(`Music queue`)
			.setDescription("Queue of next songs")
			.addFields({
				name: "Queue:",
				value: songs.join("\n")
			});

		interaction.editReply({
			embeds: [embed]
		});
	}
};
