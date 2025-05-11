
// require('dotenv').config();
// const { Client, Collection, GatewayIntentBits } = require('discord.js');
// const fs = require('node:fs');

// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.commands = new Collection();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);
//   client.commands.set(command.data.name, command);
// }

// client.once('ready', () => {
//   console.log(`Logged in as ${client.user.tag}`);
// });

// client.on('interactionCreate', async interaction => {
//   if (!interaction.isChatInputCommand()) return;

//   const command = client.commands.get(interaction.commandName);
//   if (!command) return;

//   try {
//     await command.execute(interaction);
//   } catch (error) {
//     console.error(error);
//     await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
//   }
// });

// client.login(process.env.DISCORD_TOKEN);


// require('dotenv').config(); // Load your .env file

// const { Client, GatewayIntentBits, Collection } = require('discord.js');
// const fs = require('fs');

// const client = new Client({
//   intents: [GatewayIntentBits.Guilds],
// });

// client.commands = new Collection();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// // Load each command
// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);
//   client.commands.set(command.data.name, command);
// }

// // Event: Bot is ready
// client.once('ready', () => {
//   console.log(`✅ Logged in as ${client.user.tag}`);
// });

// // Event: Slash command interaction
// client.on('interactionCreate', async interaction => {
//   if (!interaction.isChatInputCommand()) return;

//   const command = client.commands.get(interaction.commandName);
//   if (!command) return;

//   try {
//     await command.execute(interaction);
//   } catch (error) {
//     console.error(error);
//     await interaction.reply({
//       content: 'There was an error while executing this command!',
//       ephemeral: true,
//     });
//   }
// });

// // Start the bot
// client.login(process.env.DISCORD_TOKEN);


require('dotenv').config(); // Load your .env file

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Import path module to resolve nested paths

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();



// Inside after creating client
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Function to recursively read command files
function getCommandFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  return files.flatMap(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      return getCommandFiles(filePath); // Recurse into directories
    } else if (file.name.endsWith('.js')) {
      return [filePath]; // Return file path for .js files
    }
    return [];
  });
}

const commandFiles = getCommandFiles('./commands'); // Get all command files recursively

// Load each command
for (const filePath of commandFiles) {
  const command = require(path.resolve(filePath));
  client.commands.set(command.data.name, command);
}

// Event: Bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Event: Slash command interaction
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);
