const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  config: {
    name: "imgur",
    aliases: ["uploadimage", "img-upload"],
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Upload image to Imgur and return the link",
    longDescription: "Upload an image to Imgur and return the URL of the uploaded image.",
    category: "Image Upload",
    guide: {
      en: "{pn} <image> - upload an image to Imgur"
    }
  },

  onStart: async function ({ message, args }) {
    const imageURL = args[0];

    if (!imageURL) return message.reply("⚠️ | Please provide an image URL to upload to Imgur.");

    try {
      // Fetch the image and prepare for upload
      const imageStream = await axios.get(imageURL, { responseType: 'stream' });

      // Create form data with the image
      const form = new FormData();
      form.append('image', imageStream.data, 'image.jpg');
      form.append('type', 'stream');

      // Upload the image to Imgur
      const imgurResponse = await axios.post('https://api.imgur.com/3/image', form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Client-ID 225899c9a3312bd', // Your Imgur Client ID
        },
      });

      if (imgurResponse.data.success) {
        const imgurLink = imgurResponse.data.data.link;
        return message.reply(`🖼️ | Image uploaded to Imgur! Here is your link: ${imgurLink}`);
      } else {
        return message.reply("❌ | Failed to upload image to Imgur. Please try again.");
      }

    } catch (error) {
      console.error("[Imgur Error]", error.message || error);
      return message.reply("❌ | Error uploading image. Please try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};