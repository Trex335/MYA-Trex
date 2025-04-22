module.exports = {
  config: {
    name: "setprefix",
    version: "1.0",
    author: "ChatGPT",
    role: 1,
    shortDescription: { en: "Set system prefix" },
    longDescription: { en: "Set or change the system-wide prefix" },
    category: "system",
    guide: { en: "-setprefix <newPrefix>" }
  },

  onChat: async ({ args, message }) => {
    if (!args[0]) return message.reply("❌ Please provide a new prefix.");

    const fs = require("fs-extra");
    const path = require("path");
    const configPath = path.join(__dirname, "..", "config.json");

    const config = JSON.parse(fs.readFileSync(configPath));
    config.prefix = args[0];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return message.reply(`✅ Prefix changed to "${args[0]}"`);
  }
};