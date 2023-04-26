const { SlashCommandBuilder, userMention } = require("discord.js");

const AudioHelp = require("../../helpers/audio.helper");
const EmbedBuilderHelp = require("../../helpers/embedbuilder.helper");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.addStringOption((option) => option.setName("page").setDescription("Queue page"))
		.setDescription("Music queue"),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const queue = AudioHelp.getQueue(interaction.guild.id);

		let page = interaction.options.getString("page");
		if (!page) page = 1;
		page = parseInt(page);

		const limit = 10;

		const pages = Math.ceil(queue.length / limit);

		if (page > pages) {
			interaction.editReply(
				`Page not found, there ${pages > 1 ? "are" : "is"} only ${pages} page${
					pages > 1 ? "s" : ""
				}`
			);
			return;
		}

		let queuePage = queue.slice((page - 1) * limit, page * limit);

		const songs = [];
		for (const prop in queuePage) {
			const song = queuePage[prop];

			let title = song.title;
			if (title.length > 25) title = `${title.substring(0, 25).trim()}...`;

			songs.push(
				`${parseInt(prop) + 1 + limit * (page - 1)} - ${title} by ${userMention(
					song.requester
				)}`
			);
		}

		const embed = EmbedBuilderHelp(interaction.client)
			.setTitle(`Music queue`)
			.setDescription(
				!queue
					? "No soungs in queue"
					: `${queue.length} song${queue.length == 1 ? "" : "s"} in queue`
			)
			.setFooter({ text: `${page}/${pages} page${pages > 1 ? "s" : ""}` });

		if (queue)
			embed.addFields({
				name: "Queue:",
				value: songs.join("\n")
			});

		interaction.editReply({
			embeds: [embed]
		});
	}
};
