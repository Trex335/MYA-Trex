module.exports = {
  config: {
    name: "flipcoin",
    version: "1.0",
    author: "you",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Flip a coin" },
    longDescription: { en: "Flip a virtual coin and get heads or tails" },
    category: "Fun",
    guide: { en: "{pn}" },
  },

  onStart: async ({ message }) => {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    await message.reply(`🪙 You flipped: ${result}`);
  }
};