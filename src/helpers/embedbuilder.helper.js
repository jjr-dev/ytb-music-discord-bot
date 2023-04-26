const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
	return new EmbedBuilder().setColor("#c92427").setAuthor({
		name: client.user.username,
		iconURL: client.user.displayAvatarURL()
	});
};
