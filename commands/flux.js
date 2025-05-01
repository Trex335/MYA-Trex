const axios = require('axios');

module.exports = {
  config: {
    name: "flux",
    aliases: ["imagegen", "aiart"],
    version: "3.5",
    author: "Hassan + Upgraded by Tony's Request",
    countDown: 30,
    role: 0,
    shortDescription: "Generate images using AI",
    longDescription: "Generate beautiful AI images using Flux's custom API with animation.",
    category: "ai",
    guide: {
      en: "{pn} <prompt> - generate an AI image from text"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("⚠️ | Please provide a prompt. Example: /flux a futuristic cityscape");
    }

    // Send a waiting message
    await message.reply("⏳ | Please wait while your AI image is being generated...");

    try {
      const startTime = Date.now();
      const response = await axios.get(`https://ga1-8j62.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`, {
        timeout: 30000
      });
      const endTime = Date.now();
      const generationTime = endTime - startTime;

      if (!response.data || !response.data.success || !response.data.image_url) {
        throw new Error("Invalid API response format");
      }

      const imageUrl = response.data.image_url;
      return message.reply(`🎨 | Here is your AI-generated image! (Generated in ${generationTime}ms)\n${imageUrl}`);

    } catch (error) {
      console.error("Flux command error:", error.message);
      return message.reply("❌ | Failed to generate image. Error: " + error.message);
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};