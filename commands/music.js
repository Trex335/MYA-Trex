const axios = require("axios");
const yts = require("yt-search"); // ✅ Correct module

async function handleMusic({ message, args }) {
	if (!args.length) return message.reply("❌ Please provide a song name.");

	let query = args.join(" ");
	let isVideo = query.toLowerCase().endsWith("video");
	if (isVideo) query = query.replace(/ video$/i, "");

	try {
		await message.reply("🎀 Searching and preparing your file...");

		const searchResults = await yts(query);
		if (!searchResults.videos.length)
			return message.reply("⚠️ No results found.");

		const video = searchResults.videos[0];
		const videoUrl = video.url;

		const apiUrl = `https://aryan-error-sing-api.onrender.com/download?url=${videoUrl}&type=${isVideo ? "video" : "audio"}`;
		const response = await axios.get(apiUrl);

		if (!response.data || !response.data.file_url) {
			console.log("❌ Invalid API response:", response.data);
			return message.reply("❌ Failed to fetch file. Try again later.");
		}

		const replyText = `▶️ **${video.title}**\n${response.data.file_url}\nThumbnail: ${video.thumbnail}`;
		return message.reply(replyText);

	} catch (err) {
		console.error("❌ Music Command Error:", err);
		return message.reply("❌ Error occurred while fetching music.");
	}
}

module.exports = {
	config: {
		name: "music",
		aliases: ["audio", "song", "sing"],
		author: "+Hassan",
		version: "1.0",
		shortDescription: "Play audio from YouTube",
		category: "media",
		guide: {
			en: "{pn} despacito"
		}
	},
	onStart: handleMusic,
	onChat: handleMusic
};