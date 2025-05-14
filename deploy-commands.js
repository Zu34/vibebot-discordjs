// require('dotenv').config(); // ✅ Load env variables first

// const { REST, Routes } = require('discord.js');
// const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
// const fs = require('node:fs');

// const commands = [];
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);
//   commands.push(command.data.toJSON());
// }

// const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// (async () => {
//   try {
//     console.log('Started refreshing application (guild) commands.');

//     await rest.put(
//       Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
//       { body: commands }
//     );

//     console.log('Successfully reloaded guild commands.');
//   } catch (error) {
//     console.error(error);
//   }
// })();


// require('dotenv').config(); // ✅ Load env variables first

// const { REST, Routes } = require('discord.js');
// const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
// const fs = require('fs');

// const commands = [];
// const commandFiles = fs.readdirSync('./commands', { withFileTypes: true })
//   .flatMap(dir => dir.isDirectory() ? fs.readdirSync(`./commands/${dir.name}`).map(file => `./commands/${dir.name}/${file}`) : `${dir.name}`);

// console.log('Command files:', commandFiles); 

// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);
//   if (!command.data) {
//     console.error(`❌ Missing "data" in command file: ${file}`);
//     continue;
//   }
//   commands.push(command.data.toJSON());
// }

// const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// (async () => {
//   try {
//     console.log('Started refreshing application (guild) commands.');

//     await rest.put(
//       Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
//       { body: commands }
//     );

//     console.log('Successfully reloaded guild commands.');
//   } catch (error) {
//     console.error('Error while deploying commands:', error);
//   }
// })();

// require('dotenv').config();

// const { REST, Routes } = require('discord.js');
// const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
// const fs = require('fs');
// const path = require('path');

// const commands = [];

// // Recursively read command files
// function getCommandFiles(dir) {
//   const files = fs.readdirSync(dir, { withFileTypes: true });

//   return files.flatMap(file => {
//     const filePath = path.join(dir, file.name);
//     if (file.isDirectory()) {
//       return getCommandFiles(filePath);
//     } else if (file.name.endsWith('.js')) {
//       return [filePath];
//     }
//     return [];
//   });
// }

// const commandFiles = getCommandFiles('./commands');

// console.log('Command files:', commandFiles); // Debug output

// for (const filePath of commandFiles) {
//   const command = require(path.resolve(filePath));
//   if (!command.data) {
//     console.error(`❌ Missing "data" in command file: ${filePath}`);
//     continue;
//   }
//   commands.push(command.data.toJSON());
// }

// const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

// (async () => {
//   try {
//     console.log('Started refreshing application (guild) commands.');

//     await rest.put(
//       Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
//       { body: commands }
//     );

//     console.log('✅ Successfully reloaded guild commands.');
//   } catch (error) {
//     console.error('❌ Error while deploying commands:', error);
//   }
// })();

require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
const fs = require('fs');
const path = require('path');

// Recursively read command files
function getCommandFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  return files.flatMap(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      return getCommandFiles(filePath); // Recurse into subdirectories
    } else if (file.name.endsWith('.js') && file.name !== 'factUtils.js') { // Filter out factUtils.js
      return [filePath];
    }
    return [];
  });
}

const commandFiles = getCommandFiles('./commands'); // Get command files

console.log('Command files:', commandFiles); // Debug output

const commands = [];

// Load the commands
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
