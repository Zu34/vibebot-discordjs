
require('dotenv').config(); 

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Import path module to resolve nested paths

const client = new Client({

  partials: ['MESSAGE', 'CHANNEL', 'REACTION'], // Required!
  
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions, // ADD THIS!
  ],
});

client.reactionRoleMessageId = null; 
client.commands = new Collection();


const reactionDataPath = path.join(__dirname, 'reactionMessage.json');

if (fs.existsSync(reactionDataPath)) {
  const data = JSON.parse(fs.readFileSync(reactionDataPath, 'utf8'));
  client.reactionRoleMessageId = data.messageId;
  console.log(`📌 Loaded reaction message ID: ${client.reactionRoleMessageId}`);
}



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

const commandFiles = getCommandFiles('./commands');

// Load each command
for (const filePath of commandFiles) {
  const command = require(path.resolve(filePath));
  client.commands.set(command.data.name, command);
}


client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});


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


client.login(process.env.DISCORD_TOKEN);
