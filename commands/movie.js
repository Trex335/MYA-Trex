const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "movie",
    aliases: ["film", "imdb"],
    description: "Get detailed movie information from OMDb API"
  },

  onStart: async function ({ api, event, args }) {
    const movieTitle = args.join(" ");
    if (!movieTitle) {
      return api.sendMessage("🎬 Please provide a movie name.", event.threadID);
    }

    const apiKey = "435fb551";
    const movieInfoUrl = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movieTitle)}`;

    try {
      const response = await axios.get(movieInfoUrl);
      console.log('Movie info response:', response.data);

      if (response.data && response.data.Response === "True") {
        const {
          Title, Year, Runtime, Genre, Director,
          Actors, Plot, Poster, imdbRating,
          BoxOffice, Awards
        } = response.data;

        const messageBody = `🎬 *Movie:* ${Title} (${Year})\n` +
                            `⏱️ *Runtime:* ${Runtime}\n` +
                            `🎭 *Genres:* ${Genre}\n` +
                            `🎬 *Director:* ${Director}\n` +
                            `🤼 *Actors:* ${Actors}\n` +
                            `⭐ *Rating:* ${imdbRating}\n` +
                            `📖 *Plot:* ${Plot}\n` +
                            `🏅 *Awards:* ${Awards}\n` +
                            `📊 *BoxOffice:* ${BoxOffice}`;

        if (Poster && Poster !== "N/A") {
          console.log(`Fetching poster from: ${Poster}`);
          const posterResponse = await axios.get(Poster, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(posterResponse.data, 'binary');

          const tempPath = path.join(__dirname, `${Date.now()}_poster.jpg`);
          fs.writeFileSync(tempPath, buffer);

          await api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(tempPath)
          }, event.threadID, () => {
            fs.unlinkSync(tempPath); // Clean up after sending
          });
        } else {
          await api.sendMessage(messageBody, event.threadID);
        }
      } else {
        await api.sendMessage("❌ No movie information found.", event.threadID);
      }
    } catch (error) {
      console.error("Error fetching movie information:", error);
      await api.sendMessage("⚠️ Failed to fetch movie info. Please try again later.", event.threadID);
    }
  }
};