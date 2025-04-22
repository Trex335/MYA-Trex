const axios = require('axios');

async function handleDalle3({ args, message }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ | Please provide a prompt.");

    await message.reply("⏳ | Generating image...");

    const response = await axios.get(`https://hassan-dalle-api.onrender.com/dalle?prompt=${encodeURIComponent(prompt)}`);

    const imageUrl = response?.data?.generated_image;

    if (!imageUrl) {
      return message.reply("❌ | No image received from the API.");
    }

    // Send an array response so your frontend can render both text and image
    return message.reply([
      `✅ | Here is your image for: "${prompt}"`,
      imageUrl
    ]);
  } catch (error) {
    console.error("Dalle3 Error:", error.message);
    return message.reply("❌ | Failed to generate image. Please try again.");
  }
}

module.exports = {
  config: {
    name: "dalle3",
    aliases: ["dalle"],
    version: "1.0",
    author: "Hassan",
    countDown: 15,
    role: 0,
    shortDescription: "Generate images with Dalle3",
    longDescription: "Generate images using Dalle3 AI",
    category: "image",
    guide: {
      en: "{pn} <your prompt>"
    }
  },
  onStart: handleDalle3,
  onChat: handleDalle3
};