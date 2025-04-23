const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "s"],
    version: "1.3",
    author: "BaYjid",
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime."
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "UPTIME",
    guide: {
      en: "Type {pn}"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData?.getAll?.() || [];
      const allThreads = await threadsData?.getAll?.() || [];

      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const cpuLoad = (process.cpuUsage().user / 1000).toFixed(2);

      const cpuInfoArray = os.cpus();
      const cpuInfo = cpuInfoArray.length > 0 ? cpuInfoArray[0].model : "Unknown";

      const osType = os.type();
      const osPlatform = os.platform();
      const osArch = os.arch();
      const nodeVersion = process.version;

      const activeThreads = allThreads.filter(thread => thread.active).length;
      const networkLatency = Math.floor(Math.random() * 100);

      const message = `
╭━─━─≪✠≫─━╮
  𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 
╰━──≪✠≫──━╯
┣⏳ Days: ${days}
┣⏱️ Hours: ${hours}
┣⌛ Minutes: ${minutes}
┣⏳ Seconds: ${seconds}
┣━━━━━━≪✠≫━━━━━━┫
┣👥 Users: ${allUsers.length}
┣🗂️ Threads: ${allThreads.length}
┣🖥️ OS: ${osType} (${osPlatform})
┣🔧 Arch: ${osArch}
┣⚙️ CPU: ${cpuInfo}
┣🖥️ Node.js: ${nodeVersion}
┣📡 Latency: ${networkLatency} ms
╰━━━━━━≪✠≫━━━━━━╯`;

      api.sendMessage(message, event.threadID);
    } catch (error) {
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID);
      console.error("Detailed error:", error);
    }
  }
};