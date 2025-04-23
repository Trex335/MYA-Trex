const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "..", "config.json");

module.exports = {
  config: {
    name: "prefix",
    aliases: ["setprefix"]
  },
  onStart: async ({ args, message }) => {
    if (args.length === 0) {
      const currentConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return message.reply(`🔹 Current system prefix: \`${currentConfig.prefix}\``);
    }

    const newPrefix = args[0];
    if (newPrefix === "reset") {
      const defaultPrefix = "-";
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      config.prefix = defaultPrefix;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return message.reply(`✅ Prefix reset to default: \`${defaultPrefix}\``);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config.prefix = newPrefix;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return message.reply(`✅ Prefix updated to: \`${newPrefix}\``);
  }
};