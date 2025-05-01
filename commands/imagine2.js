const axios = require('axios');

module.exports = {
  config: {
    name: "imagine2",
    aliases: ["m-defusion"], 
    version: "1.2",
    author: "Samir/Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "anime image style generator",
    longDescription: "Generate anime-style images from text prompts.",
    category: "Image Generation",
    guide: {
      en: "{pn} <prompt>  --ar 16:9"
    }
  },

  onStart: async function ({ message, args }) {
    let prompt = args.join(" ");

    if (!prompt) {
      return message.reply("❗ Please provide a prompt to generate an image.");
    }

    // Send a temporary "please wait" message first
    const waitingMsg = await message.reply("🔄 Please wait, generating your anime image...");

    try {
      const apiUrl = `https://dsd-hassan-api.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`;
      const imageStream = await global.utils.getStreamFromURL(apiUrl);

      if (!imageStream) {
        return message.reply("⚠️ Failed to retrieve image.");
      }

      // After image ready, edit the waiting message if possible, or send new
      await message.reply({
        body: '✨ Here is your generated anime image!',
        attachment: imageStream
      });

      // (Optional) You can delete the waiting message if you want
      // await message.unsend(waitingMsg.messageID);

    } catch (error) {
      console.error('API Error:', error);
      await message.reply("❌ Failed to generate image. Please try again later.");
    }
  }
};