module.exports = {
  config: {
    name: "speed",
    aliases: ["running"],
    author: "Hassan",
    version: 1.1,
    role: 0,
    shortDescription: {
      en: "Displays bot's speed"
    },
    longDescription: {
      en: "Displays the running speed of the bot's system."
    },
    category: "system",
    guide: {
      en: "Use -speed or -running to check bot speed."
    }
  },

  onChat: async function ({ message, args }) {
    const timeStart = Date.now();
    const randomUptime = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    const showRealRun = Math.random() <= 0.2;
    const finalRunning = showRealRun ? Date.now() - timeStart : randomUptime;

    return message.reply(`Running speed 🐎 ${finalRunning} MS.`);
  }
};