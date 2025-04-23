const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "catfact",
    aliases: ["kittyfact"],
    version: "1.2",
    author: "Hassan",
    shortDescription: "Get a random cat fact and image",
    longDescription: "Fetches a random cat fact and shows a cute cat image separately.",
    category: "fun",
    guide: {
      en: "-catfact",
    }
  },

  onStart: async function ({ message }) {
    try {
      await message.reply("Fetching a cat fact... please wait ⏳");
      console.log("Fetching cat fact...");

      // Fetch a cat fact
      const factResponse = await axios.get('https://meowfacts.herokuapp.com/');
      console.log("Fact API response:", factResponse.data);

      const fact = factResponse.data?.data?.[0] || "No fact available";

      await message.reply(`🐱 **Cat Fact**:\n\n"${fact}"`);

      // Fetch cat image
      console.log("Fetching cat image...");
      const imageResponse = await axios.get('https://api.thecatapi.com/v1/images/search');
      console.log("Image API response:", imageResponse.data);

      const imageUrl = imageResponse.data?.[0]?.url;

      if (!imageUrl) {
        return await message.reply("❌ Couldn't fetch a cat image.");
      }

      const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageBuffer.data, 'binary');
      const tempPath = path.join(__dirname, 'cat_image.jpg');
      fs.writeFileSync(tempPath, buffer);
      console.log("Image saved:", tempPath);

      await message.reply({
        body: "Here's a random cat 🐱",
        attachment: fs.createReadStream(tempPath)
      });

      setTimeout(() => {
        fs.unlinkSync(tempPath);
        console.log("Temp image deleted.");
      }, 10000);

    } catch (error) {
      console.error("❌ Catfact Error:", error.message || error);
      await message.reply("❌ Failed to fetch cat fact or image.");
    }
  }
};