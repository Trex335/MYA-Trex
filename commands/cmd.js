const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "cmd",
    aliases: [],
    description: "Manage commands: list, load, unload, reload, install, update",
  },

  onStart: async function ({ args, message }) {
    const subcmd = args[0];
    const commandsPath = path.join(__dirname, "..", "commands");

    const isCommandFile = (file) => file.endsWith(".js");

    const listCommands = () => {
      const files = fs.readdirSync(commandsPath).filter(isCommandFile);
      return files.map((file) => {
        const name = file.replace(".js", "");
        const loaded = !!global.commands?.[name];
        const modTime = new Date(fs.statSync(path.join(commandsPath, file)).mtime).toLocaleString();
        return `${loaded ? "✅" : "❌"} ${name} (modified ${modTime})`;
      }).join("\n");
    };

    const loadCommand = async (name) => {
      const filePath = path.join(commandsPath, `${name}.js`);
      if (!fs.existsSync(filePath)) return `❌ Command '${name}' does not exist.`;

      try {
        delete require.cache[require.resolve(filePath)];
        const cmd = require(filePath);
        if (!cmd?.config?.name || typeof cmd.onStart !== "function") {
          throw new Error("Invalid command format");
        }

        if (!global.commands) global.commands = {};
        global.commands[cmd.config.name] = cmd;

        if (Array.isArray(cmd.config.aliases)) {
          cmd.config.aliases.forEach(alias => {
            global.commands[alias] = cmd;
          });
        }

        return `✅ Loaded command '${cmd.config.name}'`;
      } catch (err) {
        return `❌ Failed to load '${name}': ${err.message}`;
      }
    };

    const unloadCommand = (name) => {
      if (!global.commands?.[name]) return `❌ Command '${name}' not loaded.`;
      const cmd = global.commands[name];

      delete global.commands[name];
      if (cmd.config?.aliases?.length) {
        cmd.config.aliases.forEach(alias => {
          delete global.commands[alias];
        });
      }
      return `✅ Unloaded command '${name}'`;
    };

    const installFromURL = async (filename, url) => {
      const name = filename.replace(".js", "");
      const filePath = path.join(commandsPath, `${name}.js`);

      try {
        const res = await axios.get(url);
        await fs.writeFile(filePath, res.data);
        return await loadCommand(name);
      } catch (err) {
        return `❌ Failed to install: ${err.message}`;
      }
    };

    const updateCommand = async (name, url) => {
      const filePath = path.join(commandsPath, `${name}.js`);
      try {
        const res = await axios.get(url);
        await fs.writeFile(filePath, res.data);
        return await loadCommand(name);
      } catch (err) {
        return `❌ Failed to update: ${err.message}`;
      }
    };

    // Subcommand logic
    if (subcmd === "list") {
      return message.reply(`📦 Available commands:\n\n${listCommands()}`);
    }

    if (subcmd === "load") {
      const name = args[1];
      if (!name) return message.reply("❗ Usage: cmd load <name>");
      return message.reply(await loadCommand(name));
    }

    if (subcmd === "unload") {
      const name = args[1];
      if (!name) return message.reply("❗ Usage: cmd unload <name>");
      return message.reply(unloadCommand(name));
    }

    if (subcmd === "reload") {
      const name = args[1];
      if (!name) return message.reply("❗ Usage: cmd reload <name>");
      const unloadMsg = unloadCommand(name);
      const loadMsg = await loadCommand(name);
      return message.reply(`${unloadMsg}\n${loadMsg}`);
    }

    if (subcmd === "reloadAll") {
      const files = fs.readdirSync(commandsPath).filter(isCommandFile);
      const results = await Promise.all(files.map(file => {
        const name = file.replace(".js", "");
        unloadCommand(name);
        return loadCommand(name);
      }));
      return message.reply(`♻️ Reloaded all:\n\n${results.join("\n")}`);
    }

    if (subcmd === "install") {
      if (args.length === 3) {
        const [_, filename, url] = args;
        return message.reply(await installFromURL(filename, url));
      } else if (args.length === 2) {
        const url = args[1];
        const name = path.basename(url).replace(".js", "");
        return message.reply(await installFromURL(name, url));
      } else {
        return message.reply("❗ Usage:\n- cmd install <url>\n- cmd install <filename.js> <url>");
      }
    }

    if (subcmd === "update") {
      const name = args[1];
      const url = args[2];
      if (!name || !url) return message.reply("❗ Usage: cmd update <name> <url>");
      return message.reply(await updateCommand(name, url));
    }

    return message.reply("❗ Unknown subcommand. Try `cmd list`, `cmd load <name>`, `cmd install <url>`");
  }
};