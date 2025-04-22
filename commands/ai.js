const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ai2",
    version: "3.0.0",
    author: "Hassan + ChatGPT",
    role: 2,
    category: "ai",
    shortDescription: { en: "AI edits your images or answers prompts" },
    longDescription: { en: "Reply to an image with a prompt to edit it, or just ask any AI question." },
    guide: {
      en: `{pn} <prompt>\n\nOr reply to an image with:\n<prompt> (no prefix needed)\n\nExamples:\n- glowing neon street\n- turn this into anime style`,
    },
  },

  onStart: async function () {},

  onChat: async function ({ api, event, args, message }) {
    try {
      const body = event.body?.trim();
      const reply = event.messageReply;
      const hasImage = reply?.attachments?.[0]?.type === "photo";

      if (!body) return;

      if (hasImage && body.length > 3) {
        const prompt = encodeURIComponent(body);
        const imageUrl = reply.attachments[0].url;

        api.setMessageReaction("🧠", event.messageID, () => {}, true);

        const apiUrl = `https://gemini-api-riz7.onrender.com/edit?text=${prompt}&url=${encodeURIComponent(imageUrl)}`;
        const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

        const result = res.headers["content-type"].includes("application/json")
          ? JSON.parse(Buffer.from(res.data).toString())
          : null;

        if (result?.result?.includes("not able")) {
          return message.reply(`❌ | ${result.result}`);
        }

        const filePath = path.join(__dirname, "..", "public", `edited.png`);
        await fs.outputFile(filePath, res.data);

        await message.reply({
          body: `✅ | Edited with prompt: "${body}"`,
          attachment: fs.createReadStream(filePath),
        });

        await fs.remove(filePath);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        return;
      } else {
        // If no image, use text-only AI prompt
        const response = await axios.get(`https://yau-ai-runing-station.vercel.app/ai?prompt=${encodeURIComponent(body)}&cb=${Date.now()}`);
        let data = response.data;

        try {
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (e) {
          return message.reply("❌ | Failed to parse AI response.");
        }

        const answer = data?.response || "⚠️ No response from AI.";
        return message.reply(answer);
      }
    } catch (err) {
      console.error("AI2 error:", err);
      return message.reply("❌ | Something went wrong: " + err.message);
    }
  },
};