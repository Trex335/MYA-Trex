const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const COMMANDS_DIR = path.join(__dirname, "commands");
const PUBLIC_DIR = path.join(__dirname, "public");
const PREFIX = "-";

// Ensure directories exist
fs.ensureDirSync(COMMANDS_DIR);
fs.ensureDirSync(PUBLIC_DIR);

// Middleware
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

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
        console.log(`✅ Loaded command: ${PREFIX}${cmd.config.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load ${file}:`, err);
    }
  });
}

loadCommands();

// Parse input message
function handleCommand(input) {
  if (!input.startsWith(PREFIX)) return null;

  const args = input.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const text = args.join(" ");

  return { commandName, args, text };
}

// Command API
app.post("/api/command", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "❌ Message is required" });

    // Respond to "prefix" or "Prefix"
    if (message.trim().toLowerCase() === "prefix") {
      return res.json({ reply: `🔹 My command prefix is: \`${PREFIX}\`` });
    }

    const cmd = handleCommand(message);
    if (!cmd) return res.end(); // Ignore messages without prefix

    // Built-in -ai command
    if (cmd.commandName === "ai") {
      try {
        const response = await axios.get(
          `https://yau-ai-runing-station.vercel.app/ai?prompt=${encodeURIComponent(cmd.text)}&cb=${Date.now()}`,
          { headers: { Accept: "application/json" }, responseType: "text" }
        );

        let data;
        try {
          data = JSON.parse(response.data);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (parseErr) {
          console.error("Failed to parse AI response:", response.data);
          return res.status(500).json({ reply: "❌ AI returned invalid JSON format" });
        }

        const reply = data?.response || JSON.stringify(data) || "⚠️ No response from AI";
        return res.json({ reply });
      } catch (aiError) {
        console.error("AI API Error:", aiError.message);
        return res.status(500).json({ reply: `❌ AI Error: ${aiError.message}` });
      }
    }

    // Built-in -cmd commands
    if (cmd.commandName === "cmd") {
      const subCmd = cmd.args[0];
      if (subCmd === "install" && cmd.args[1] && cmd.args[2]) {
        const fileName = cmd.args[1];
        const url = cmd.args[2];

        if (!fileName.endsWith(".js")) {
          return res.json({ reply: "❌ Only .js files can be installed" });
        }

        try {
          const response = await axios.get(url, {
            headers: {
              "User-Agent": "Mozilla/5.0"
            }
          });
          await fs.writeFile(path.join(COMMANDS_DIR, fileName), response.data);
          loadCommands();
          return res.json({ reply: `✅ Installed command: ${fileName}` });
        } catch (err) {
          return res.status(500).json({ reply: `❌ Install failed: ${err.message}` });
        }
      }

      if (subCmd === "list") {
        return res.json({
          reply: `📜 Installed commands:\n${Object.keys(commands).map(c => PREFIX + c).join("\n") || "None"}`
        });
      }

      return res.json({ reply: "❌ Invalid subcommand. Use: install <filename.js> <url> or list" });
    }

    // Installed commands
    const command = commands[cmd.commandName];
    if (!command) return res.json({ reply: "❌ Command not found" });

    const result = await command.onChat({
      api: { sendMessage: (msg) => console.log(msg) },
      event: { body: cmd.text },
      args: cmd.args,
      message: {
        reply: (content) => {
          if (!res.headersSent) res.json({ reply: content });
        },
      },
    });

    if (!res.headersSent) {
      res.json(result || { reply: "✅ Command executed" });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: `❌ Server Error: ${error.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔹 Prefix: "${PREFIX}"`);
});