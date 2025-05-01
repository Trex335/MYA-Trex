module.exports = {
  config: {
    name: "openart",
    aliases: ["oa", "openaiimage"],
    version: "1.0",
    author: "ChatGPT",
    countDown: 8,
    role: 0,
    shortDescription: "Generate an image using OpenArt",
    longDescription: "Creates an AI image using OpenArt's preview system (no API key required).",
    category: "ai",
    guide: {
      en: "{pn} <your prompt> - generate an image using OpenArt"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("⚠️ | Please provide a prompt. Example: /openart a glowing mountain in winter");

    try {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}.jpg`;

      await message.reply(`🖼️ | OpenArt-style image generated for: "${prompt}"`);
      return message.reply(imageUrl);
    } catch (error) {
      console.error("[OpenArt Error]", error.message || error);
      return message.reply("❌ | Image generation failed. Try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};