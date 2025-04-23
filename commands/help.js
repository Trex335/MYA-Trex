module.exports = {
  config: {
    name: "help",
    version: "1.0",
    author: "you",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Get a list of commands" },
    longDescription: { en: "See all the available commands for the bot" },
    category: "Utility",
    guide: { en: "{pn}" },
  },

  onStart: async ({ message }) => {
    const commandsList = [
      "-ping: Check if the bot is responsive",
      "-joke: Get a random joke",
      "-time: Get the current server time",
      "-help: See this message",
    ];

    await message.reply(`📝 Here are the available commands:\n\n${commandsList.join("\n")}`);
  }
};