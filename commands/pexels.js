const axios = require('axios');

async function handlePexels({ args, message }) {
    try {
        const numResults = parseInt(args[0]) || 4;
        const query = isNaN(numResults) ? args.join(' ') : args.slice(1).join(' ') || 'nature';
        const apiKey = 'NoL8ytYlwsYIqmkLBboshW909HzoBoBnGZJbpmwAcahp5PF9TAnr9p7Z';
        const url = `https://api.pexels.com/v1/search?query=${query}&per_page=${numResults}`;

        const { data } = await axios.get(url, {
            headers: { 'Authorization': apiKey }
        });

        const results = data.photos.map(photo => photo.src.large);

        return message.reply(results);  // Return array of URLs
    } catch (error) {
        console.error("Pexels Error:", error);
        return message.reply("❌ Something went wrong.");
    }
}

module.exports = {
    config: {
        name: "pexels",
        aliases: ["px"],
        author: "+Hassan",
        version: "1.0",
        shortDescription: "Search images from Pexels",
        category: "utility",
        guide: {
            en: "{pn} 5 cats"
        }
    },
    onStart: handlePexels,
    onChat: handlePexels
};