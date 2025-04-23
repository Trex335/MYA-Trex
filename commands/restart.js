const fs = require("fs-extra");

module.exports = {
  config: {
    name: "restart",
    version: "1.1",
    author: "NTKhang & Tony Sage",
    countDown: 5,
    role: 2,
    description: "Restart bot",
    category: "Owner",
    guide: "{pn}: Restart the bot"
  },

  onLoad: function ({ api }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      const seconds = ((Date.now() - time) / 1000).toFixed(2);
      api.sendMessage(`✅ | Bot restarted\n⏰ | Time: ${seconds}s`, tid);
      fs.unlinkSync(pathFile);
    }
  },

  onStart: async function ({ message, event }) {
    const tmpFolder = `${__dirname}/tmp`;
    if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder);

    const pathFile = `${tmpFolder}/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

    await message.reply("🔄 | Restarting bot...");
    process.exit(2);
  }
};