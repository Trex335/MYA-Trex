module.exports = {
  config: {
    name: "help2",
    version: "1.0",
    author: "you",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get help for a command" },
    longDescription: { en: "View guide info for a specific command" },
    category: "Utility",
    guide: { en: "{pn} <command>" },
  },

  onStart: async ({ args, message }) => {
    const target = args[0]?.toLowerCase();
    const cmd = global.commands?.[target];

    if (!target || !cmd) {
      return message.reply("❌ | Command not found or not provided.");
    }

    const guide = cmd.config?.guide?.en || "No guide available.";
    return message.reply(`ℹ️ Help for **${target}**:\n\n${guide}`);
  }
};