const axios = require('axios');

module.exports = {
  config: {
    name: "poli",
    aliases: ["polli", "poligen", "dallefree"],
    version: "1.4",
    author: "Hassan + ChatGPT",
    countDown: 10,
    role: 0,
    shortDescription: "Generate realistic AI images using Poli",
    longDescription: "Generates realistic AI images using the free Pollinations API.",
    category: "ai",
    guide: {
      en: "{pn} <prompt> - Generate a realistic image from your prompt"
    }
  },

  onStart: async function ({ message, args }) {
    const userPrompt = args.join(" ");
    if (!userPrompt) {
      return message.reply("⚠️ | Please enter a prompt. Example: /poli a cat in space");
    }

    const fullPrompt = `realistic ${userPrompt}`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}.jpg`;

    try {
      await message.reply(`🖼️ | Realistic image generated for: "${userPrompt}"`);
      return message.reply(imageUrl);  // Sent alone to trigger frontend image view
    } catch (error) {
      console.error("[Poli Error]", error.message || error);
      return message.reply("❌ | Failed to generate image. Please try again.\n" + (error.message || ""));
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
const axios = require('axios');

module.exports = {
  config: {
    name: "lexi",
    aliases: ["lexica", "lexigen"],
    version: "1.0",
    author: "ChatGPT",
    countDown: 10,
    role: 0,
    shortDescription: "Generate images with Lexica API",
    longDescription: "Generate AI images using Lexica's free search-based API (returns real images based on prompt match).",
    category: "ai",
    guide: {
      en: "{pn} <prompt> - Generates an image using Lexica AI"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("⚠️ | Please enter a prompt. Example: /lexi a cyberpunk samurai");
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://lexica.art/api/v1/search?q=${encodedPrompt}`;

    try {
      const response = await axios.get(apiUrl);
      const results = response.data.images;

      if (!results || results.length === 0) {
        return message.reply("❌ | No results found. Try a different prompt.");
      }

      const imageUrl = results[0].src;

      await message.reply(`🖼️ | Lexica image result for: "${prompt}"`);
      return message.reply(imageUrl); // standalone URL for frontend to render

    } catch (error) {
      console.error("[Lexi Error]", error.message || error);
      return message.reply("❌ | Failed to generate image. Please try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};