
require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
const fs = require('fs');
const path = require('path');

function getCommandFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  return files.flatMap(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      return getCommandFiles(filePath);
    } else if (file.name.endsWith('.js')) {
      return [filePath];
    }
    return [];
  });
}

const allCommandFiles = getCommandFiles('./commands');
console.log('Command files:', allCommandFiles);

const commandFiles = allCommandFiles.filter(file => 
  !file.endsWith('factUtils.js') && 
  !file.endsWith('birthdayUtils.js')
);

const commands = [];

for (const filePath of commandFiles) {
  const command = require(path.resolve(filePath));
  if (!command.data) {
    console.error(`❌ Missing "data" in command file: ${filePath}`);
    continue;
  }
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (guild) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded guild commands.');
  } catch (error) {
    console.error('❌ Error while deploying commands:', error);
  }
})();
