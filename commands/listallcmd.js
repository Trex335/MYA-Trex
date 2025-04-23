module.exports = {
  config: {
    name: "listallcmd",
    version: "1.0",
    author: "kshitiz",
    countDown: 5,
    role: 0,
    shortDescription: { en: "List all available commands" },
    longDescription: { en: "View a comprehensive list of all available commands" },
    category: "Admin 🛠",
    guide: { en: "{pn}" },
    priority: 1
  },

  onStart: async function ({ message }) {
    const allCommands = Object.keys(global.commands || {});
    if (!allCommands.length) return message.reply("❌ | No commands loaded.");

    const commandList = allCommands.map(cmd => `• -${cmd}`).join("\n");
    await message.reply(`📜 Available commands:\n\n${commandList}`);
  }
};