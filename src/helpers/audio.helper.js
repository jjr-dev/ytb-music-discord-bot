let audioPlayers = [];

const { userMention } = require("discord.js");
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
	AudioPlayerStatus,
	NoSubscriberBehavior
} = require("@discordjs/voice");

const url = require("url");
const querystring = require("querystring");

const ytdl = require("ytdl-core-discord");
const ytSearch = require("yt-search");

const EmbedBuilderHelp = require("./embedbuilder.helper");

exports.createUrlByVideoId = (id) => {
	return `https://youtu.be/${id}`;
};

exports.getVideoOrPlaylistIdFromUrl = (ytbUrl) => {
	const parsedUrl = url.parse(ytbUrl);
	if (!parsedUrl.hostname) return false;

	const queryParams = querystring.parse(parsedUrl.query);

	let hostname = parsedUrl.hostname;
	hostname = hostname.split(".");
	if (hostname[0].includes("www")) hostname.shift();

	hostname = hostname.join(".");

	if (!["youtube.com", "youtu.be"].includes(hostname)) return false;

	if (hostname === "youtu.be")
		return { type: "video", id: parsedUrl.pathname.substring(1) };

	if (queryParams.list) return { type: "list", id: queryParams.list };

	if (queryParams.v) return { type: "video", id: queryParams.v };

	return false;
};

exports.createEmbedPlayer = (data) => {
	const { interaction, video, added } = data;

	const embed = EmbedBuilderHelp(interaction.client)
		.setTitle(`${added ? "Added in queue" : "Playing"} ${video.title}`)
		.setImage(video.image)
		.addFields([
			{
				name: "Requested by",
				value: userMention(video.requester),
				inline: true
			},
			{
				name: "Duration",
				value: video.duration.timestamp,
				inline: true
			},
			{
				name: "URL",
				value: video.url
			}
		]);

	return embed;
};

exports.skipAudio = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { guild } = data;

			this.removeAndPlay({ remove: 0, guild });

			resolve();
		} catch (err) {
			console.log(err);
			reject("Intern error");
		}
	});
};

exports.repeatAudio = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { guild } = data;

			this.removeAndPlay({ guild });

			resolve();
		} catch (err) {
			console.log(err);
			reject("Intern error");
		}
	});
};

exports.eventsPlayer = (data) => {
	const { guild } = data;

	const player = this.getPlayer(guild);

	player.on(AudioPlayerStatus.Idle, () => {
		this.removeAndPlay({ remove: 0, guild });
	});

	player.on("error", (err) => {
		console.error(`Error: ${err.message} with resource ${err.resource.metadata}`);

		const interaction = this.getInteraction(guild);

		const embed = EmbedBuilderHelp(interaction.client)
			.setTitle(`An error has occurred`)
			.setDescription("The connection to the music has been lost");

		interaction.channel.send({
			embeds: [embed]
		});
	});
};

exports.removeAndPlay = (data) => {
	const { remove, guild } = data;

	if (remove !== null && remove !== undefined) this.removeQueue({ guild, index: remove });

	this.nextQueuePlayer(guild)
		.then((data) => {
			const { video } = data;

			if (!video) return false;

			const interaction = this.getInteraction(guild);

			const embed = this.createEmbedPlayer({ video, added: false, interaction });

			interaction.channel.send({
				embeds: [embed]
			});

			return true;
		})
		.catch((err) => {
			console.log(err);
			return false;
		});
};

exports.savePlayer = (data) => {
	data.queue = [];

	audioPlayers.push(data);
};

exports.saveResource = (data) => {
	const { guild, resource } = data;

	const playerIndex = audioPlayers.findIndex((audio) => audio.guild === guild);

	if (playerIndex < 0) return false;

	audioPlayers[playerIndex].resource = resource;
};

exports.getResource = (guild) => {
	const i = audioPlayers.find((audio) => audio.guild === guild);

	if (!i) return false;

	return i.resource;
};

exports.getInteraction = (guild) => {
	const i = audioPlayers.find((audio) => audio.guild === guild);

	if (!i) return false;

	return i.interaction;
};

exports.getPlayer = (guild) => {
	const i = audioPlayers.find((audio) => audio.guild === guild);

	if (!i) return false;

	return i.player;
};

exports.playAudio = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { music, interaction } = data;

			const voice = interaction.member.voice.channel;

			if (!voice) {
				reject("Access a voice server to request a song");
				return;
			}

			const guild = interaction.guild.id;

			const yt_id = this.getVideoOrPlaylistIdFromUrl(music);

			const searchQuery = {};
			if (yt_id) {
				searchQuery[yt_id.type === "video" ? "videoId" : "listId"] = yt_id.id;
			} else {
				searchQuery["query"] = music;
			}

			const search = await ytSearch(searchQuery).catch((err) => {
				console.log(err);
				reject(`Music ${music} not found`);
				return;
			});

			let playlist;
			let video;
			if (!yt_id) {
				const videos = search.videos;
				videos.sort((a, b) => a.views > b.views);

				video = videos[0];
			} else if (yt_id.type === "video") {
				video = search;
			} else {
				video = search.videos[0];
				video.url = this.createUrlByVideoId(video.videoId);

				search.videos.shift();
				playlist = search.videos;
			}

			let connection = getVoiceConnection(guild);

			if (!connection) {
				connection = await this.createConnection({
					channel: voice.id,
					guild: guild,
					adapter: interaction.guild.voiceAdapterCreator
				}).catch((err) => {
					console.log(err);
					reject("Error creating connection");
					return;
				});
			}

			if (!connection) return reject("Intern error");

			let player = this.getPlayer(guild);

			if (!player) {
				player = await this.createPlayer().catch((err) => {
					console.log(err);
					reject("Error creating player");
					return;
				});

				this.savePlayer({
					guild,
					player,
					interaction
				});

				this.eventsPlayer({ guild });
			}

			if (!this.addQueue({ guild, video, requester: interaction.user.id })) {
				reject("Error adding music to queue");
				return;
			}

			if (player.state.status === AudioPlayerStatus.Playing) {
				if (playlist) this.addPlaylistQueue({ playlist, interaction });

				resolve({ added: true, video });
				return;
			}

			this.nextQueuePlayer(guild)
				.then((data) => {
					const { video } = data;

					if (!video) return;

					resolve({ added: false, video });
				})
				.catch((err) => {
					console.log(err);
					reject("Error creating player");
				});

			if (playlist) this.addPlaylistQueue({ playlist, interaction });
		} catch (err) {
			console.log(err);
			reject("Intern error");
		}
	});
};

exports.addPlaylistQueue = (data) => {
	const { playlist, interaction } = data;

	for (const video of playlist) {
		video.url = this.createUrlByVideoId(video.videoId);
		this.addQueue({ guild: interaction.guild.id, video, requester: interaction.user.id });
	}

	const embed = EmbedBuilderHelp(interaction.client)
		.setTitle(`Added songs from playlist`)
		.setDescription(
			`${playlist.length} songs added via playlist sent by ${interaction.user}`
		);

	interaction.channel.send({
		embeds: [embed]
	});
};

exports.nextQueuePlayer = (guild) => {
	return new Promise(async (resolve, reject) => {
		const queue = this.getQueue(guild);
		const video = queue[0];

		if (!video) return resolve({ video });

		const player = this.getPlayer(guild);
		const connection = getVoiceConnection(guild);

		if (!player || !connection) {
			reject("Player or connection not found");
			return;
		}

		const resource = await this.createResource({ video }).catch((err) => {
			reject(err);
			return;
		});

		this.saveResource({ guild, resource });

		this.playResource({ player, resource, connection });

		resolve({ video });
	});
};

exports.removePlayer = (guild) => {
	const playerIndex = audioPlayers.findIndex((audio) => audio.guild === guild);

	if (playerIndex < 0) return;

	audioPlayers.splice(playerIndex, 1);
};

exports.addQueue = (data) => {
	const { guild, video, requester } = data;

	const playerIndex = audioPlayers.findIndex((audio) => audio.guild === guild);

	if (playerIndex < 0) return false;

	video.requester = requester;

	audioPlayers[playerIndex].queue.push(video);

	return true;
};

exports.removeQueue = (data) => {
	const { guild, index } = data;

	const playerIndex = audioPlayers.findIndex((audio) => audio.guild === guild);

	audioPlayers[playerIndex].queue.splice(index, 1);
};

exports.getQueue = (guild) => {
	const i = audioPlayers.find((audio) => audio.guild === guild);

	if (!i) return false;

	return i.queue;
};

exports.createConnection = (data) => {
	return new Promise((resolve, reject) => {
		try {
			const { channel, guild, adapter } = data;

			const connection = joinVoiceChannel({
				channelId: channel,
				guildId: guild,
				adapterCreator: adapter
			});

			resolve(connection);
		} catch (err) {
			reject(err);
		}
	});
};

exports.playResource = (data) => {
	return new Promise((resolve, reject) => {
		try {
			const { player, connection, resource } = data;
			player.play(resource);
			connection.subscribe(player);

			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

exports.createPlayer = () => {
	return new Promise((resolve) => {
		const player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause
			}
		});

		resolve(player);
	});
};

exports.createResource = (data) => {
	return new Promise((resolve, reject) => {
		const { video } = data;

		ytdl(video.url, {
			filter: "audioonly",
			quality: "lowestaudio"
		})
			.then((stream) => {
				const resource = createAudioResource(stream, { inlineVolume: true });

				resolve(resource);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

exports.leaveAudio = (guild) => {
	return new Promise((resolve, reject) => {
		try {
			const connection = getVoiceConnection(guild);
			if (connection) connection.destroy();

			this.removePlayer(guild);

			resolve();
		} catch (err) {
			console.log(err);
			reject("Error when stopping music");
		}
	});
};

exports.setVolume = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { guild, volume } = data;

			const resource = this.getResource(guild);
			if (!resource) return reject("Stream not found");

			const volumes = {
				from: resource.volume.volume,
				to: volume
			};

			if (volumes.from === volumes.to)
				return reject(`Volume already defined in ${volumes.to}`);

			resource.volume.setVolume(volume);

			resolve(volumes);
		} catch (err) {
			console.log(err);
			reject("Error when changing volume");
		}
	});
};

exports.pauseAudio = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { guild } = data;

			const player = this.getPlayer(guild);
			if (!player) return reject("Stream not found");

			player.pause();

			resolve();
		} catch (err) {
			reject("Intern error");
		}
	});
};

exports.unpauseAudio = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { guild } = data;

			const player = this.getPlayer(guild);
			if (!player || !connection) return reject("Stream not found");

			player.unpause();

			resolve();
		} catch (err) {
			console.log(err);
			reject("Intern error");
		}
	});
};
