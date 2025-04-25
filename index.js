const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const config = require("./config.json");

// Global setup
global.GoatBot = { config };
global.utils = {
  log: {
    info: (...args) => console.log("[INFO]", ...args),
    err: (...args) => console.error("[ERROR]", ...args)
  },
  getText: (category, key, val) => `✅ Uptime system is active at: ${val}`
};

const app = express();
const PORT = process.env.PORT || config.dashBoard.port;
const COMMANDS_DIR = path.join(__dirname, "commands");
const PUBLIC_DIR = path.join(__dirname, "public");
const PREFIX = config.prefix;

// Auto Uptime
if (global.timeOutUptime) clearTimeout(global.timeOutUptime);
if (config.autoUptime.enable) {
  let myUrl = config.autoUptime.url || (
    process.env.REPL_OWNER
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : process.env.API_SERVER_EXTERNAL === "https://api.glitch.com"
      ? `https://${process.env.PROJECT_DOMAIN}.glitch.me`
      : `http://localhost:${PORT}`
  );

  let status = "ok";
  setTimeout(async function autoUptime() {
    try {
      await axios.get(myUrl + "/uptime");
      if (status !== "ok") {
        status = "ok";
        global.utils.log.info("UPTIME", "Bot is online");
      }
    } catch (e) {
      const err = e.response?.data || e;
      if (status !== "ok") return;
      status = "failed";

      if (err.statusAccountBot === "can't login") {
        global.utils.log.err("UPTIME", "Can't login account bot");
      } else if (err.statusAccountBot === "block spam") {
        global.utils.log.err("UPTIME", "Your account is blocked");
      }
    }
    global.timeOutUptime = setTimeout(autoUptime, config.autoUptime.timeInterval);
  }, config.autoUptime.timeInterval);

  global.utils.log.info("AUTO UPTIME", global.utils.getText("autoUptime", "autoUptimeTurnedOn", myUrl));
}

// Express setup
fs.ensureDirSync(COMMANDS_DIR);
fs.ensureDirSync(PUBLIC_DIR);
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Routes
app.get("/uptime", (req, res) => {
  res.send("✅ Bot is alive");
});

// Command loader
const commands = {};
function loadCommands() {
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(COMMANDS_DIR)) delete require.cache[key];
  });

  const commandFiles = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js"));
  commandFiles.forEach(file => {
    try {
      const cmd = require(path.join(COMMANDS_DIR, file));
      if (cmd.config?.name) {
        commands[cmd.config.name] = cmd;
        if (Array.isArray(cmd.config.aliases)) {
          cmd.config.aliases.forEach(alias => commands[alias] = cmd);
        }
        console.log(`✅ Loaded command: ${PREFIX}${cmd.config.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load ${file}:`, err);
    }
  });
}
loadCommands();

// Handle input
function handleCommand(input) {
  if (!input.startsWith(PREFIX)) return null;
  const args = input.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const text = args.join(" ");
  return { commandName, args, text };
}

// API handler
app.post("/api/command", async (req, res) => {
  try {
    const { message, repliedTo } = req.body;
    if (!message) return res.status(400).json({ reply: "❌ Message is required" });

    if (message.trim().toLowerCase() === "prefix") {
      return res.json({ reply: `🔹 My command prefix is: \`${PREFIX}\`` });
    }

    const cmd = handleCommand(message);
    if (!cmd) return res.end();

    // AI command
    if (cmd.commandName === "ai") {
      try {
        const prompt = repliedTo ? `Replying to "${repliedTo}": ${cmd.text}` : cmd.text;
        const response = await axios.get(
          `https://yau-ai-runing-station.vercel.app/ai?prompt=${encodeURIComponent(prompt)}&cb=${Date.now()}`,
          { headers: { Accept: "application/json" }, responseType: "text" }
        );

        let data;
        try {
          data = JSON.parse(response.data);
          if (typeof data === "string") data = JSON.parse(data);
        } catch {
          return res.status(500).json({ reply: "❌ AI returned invalid JSON format" });
        }

        return res.json({ reply: data?.response || JSON.stringify(data) || "⚠️ No response from AI" });
      } catch (aiError) {
        return res.status(500).json({ reply: `❌ AI Error: ${aiError.message}` });
      }
    }

    // Custom commands
    const command = commands[cmd.commandName];
    if (!command) return res.json({ reply: "❌ Command not found" });
    if (typeof command.onStart !== "function") {
      return res.json({ reply: "❌ This command does not support execution" });
    }

    const replies = [];
    await command.onStart({
      api: {
        sendMessage: (msg) => replies.push(typeof msg === "string" ? msg : JSON.stringify(msg))
      },
      event: {
        body: cmd.text,
        repliedTo: repliedTo || null
      },
      args: cmd.args,
      message: {
        reply: (content) => replies.push(content)
      }
    });

    if (!res.headersSent) {
      res.json({ reply: replies.length === 1 ? replies[0] : replies });
    }

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: `❌ Server Error: ${error.message}` });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔹 Prefix: "${PREFIX}"`);
});
