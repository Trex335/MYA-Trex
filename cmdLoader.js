
const fs = require("fs");
const path = require("path");

const loadCommands = () => {
  const commandsDir = path.join(__dirname, "..", "commands");
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));
  const commands = {};

  for (const file of commandFiles) {
    const commandPath = path.join(commandsDir, file);
    const command = require(commandPath);
    commands[command.config.name] = command;
  }

  return commands;
};

module.exports = { loadCommands };
