module.exports = {
  config: {
    name: "ping",
    version: "1.0",
    author: "you",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Ping the bot" },
    longDescription: { en: "Check if the bot is responsive" },
    category: "Utility",
    guide: { en: "{pn}" },
  },

  onStart: async ({ message }) => {
    const start = Date.now();
    const responseTime = Date.now() - start;
    await message.reply(`⏳ Pinging...\n🏓 Pong! Response time: ${responseTime}ms`);
  }
};