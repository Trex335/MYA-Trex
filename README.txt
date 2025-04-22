
DROP THE `commands/` and `utils/` FOLDERS INTO YOUR EXISTING PROJECT ROOT.

- Keep your current index.js unchanged.
- Load and use `loadCommands()` from `utils/cmdLoader.js` to register commands dynamically.
- `ai.js` will be auto-invoked if conditions are met (image reply with prompt).

Example:
const { loadCommands } = require("./utils/cmdLoader");
const commands = loadCommands();

Then manually invoke `commands[cmdName].onChat({...})` in your app if needed.
