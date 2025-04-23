const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "music",
		aliases: ["audio", "song", "sing"],
		version: "0.0.2",
		author: "ArYAN",
		countDown: 5,
		role: 0,
		shortDescription: "Download audio or video from YouTube",
		longDescription: "Searches YouTube and downloads audio in MP3 format or video in MP4 format.",
		category: "media",
		guide: "{pn} [song name] or [song name video]",
	},

	onStart: async function ({ message, args }) {
		if (!args.length)
			return message.reply("❌ Please provide a song name.");

		let query = args.join(" ");
		let isVideo = query.toLowerCase().endsWith("video");
		if (isVideo) query = query.replace(/ video$/i, "");

		try {
			message.reply("🎀 Searching and preparing your file...");

			const searchResults = await yts(query);
			if (!searchResults.videos.length)
				return message.reply("⚠️ No results found.");

			const video = searchResults.videos[0];
			const videoUrl = video.url;
			const videoTitle = video.title;
			const thumbnail = video.thumbnail;

			const apiUrl = `https://aryan-error-sing-api.onrender.com/download?url=${videoUrl}&type=${isVideo ? "video" : "audio"}`;
			const response = await axios.get(apiUrl);

			if (!response.data || !response.data.file_url) {
				console.log("❌ Invalid API response:", response.data);
				return message.reply("❌ Failed to fetch file. Try again later.");
			}

			const fileUrl = response.data.file_url;
			const fileExtension = isVideo ? "mp4" : "mp3";
			const fileName = `${Date.now()}.${fileExtension}`;
			const filePath = path.join(__dirname, "cache", fileName);

			// Ensure cache directory exists
			const cacheDir = path.join(__dirname, "cache");
			if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

			// Download stream
			const fileStream = await global.utils.getStreamFromURL(fileUrl);
			if (!fileStream) {
				console.log("❌ Failed to get file stream.");
				return message.reply("❌ Could not download the file.");
			}

			// Show thumbnail first
			await message.reply({
				body: `🎵 Title: ${videoTitle}`,
				attachment: await global.utils.getStreamFromURL(thumbnail),
			});

			// Save file
			const writer = fs.createWriteStream(filePath);
			fileStream.pipe(writer);
			writer.on("finish", async () => {
				await message.reply({
					attachment: fs.createReadStream(filePath),
				});

				// Delete file after 10s
				setTimeout(() => {
					fs.unlink(filePath, (err) => {
						if (err) console.error("Error deleting file:", err);
					});
				}, 10000);
			});

			writer.on("error", (err) => {
				console.error("Writer error:", err);
				message.reply("❌ Error writing file.");
			});

		} catch (error) {
			console.error("❌ Music Command Error:", error);
			return message.reply(`⚠️ Error: ${error.message}`);
		}
	},
};