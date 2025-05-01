const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "flux2",
    aliases: ["flux-image", "fluxgen"],
    version: "2.0",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Flux image generator with Imgur upload",
    longDescription: "Generate high-quality images using Flux2 API and upload to Imgur.",
    category: "Image Generation",
    guide: {
      en: "{pn} <your prompt> - generate an image using Flux2 and upload to Imgur"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("⚠️ | Please provide a prompt. Example: /flux2 a futuristic flying city");

    try {
      // Call Flux2 API to generate image stream (get raw image data)
      const apiUrl = `https://flux2-hassan-api.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`;
      const imageStream = await axios.get(apiUrl, { responseType: 'stream' });

      if (!imageStream.data) {
        return message.reply("❌ | Could not retrieve image from the API.");
      }

      // Upload the image to Imgur
      const form = new FormData();
      form.append('image', imageStream.data, 'flux2-generated-image.jpg');
      form.append('type', 'stream');

      const imgurResponse = await axios.post('https://api.imgur.com/3/image', form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Client-ID 225899c9a3312bd'
        }
      });

      if (imgurResponse.data.success) {
        const imgUrl = imgurResponse.data.data.link;
        return message.reply(`🖼️ | Image generated and uploaded to Imgur for: "${prompt}"\n${imgUrl}`);
      } else {
        return message.reply("❌ | Failed to upload image to Imgur.");
      }

    } catch (error) {
      console.error("[Flux2 Error]", error.message || error);
      return message.reply("❌ | Image generation failed. Try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};