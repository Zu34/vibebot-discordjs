
require('dotenv').config(); 

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Import path module to resolve nested paths
const cron = require('node-cron');
// const { sendDailyFacts } = require('./commands/subscription/subscribe'); // Import daily facts function
const { sendDailyFacts, fetchRandomFact } = require('./commands/subscription/factUtils');

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

const commandFiles = getCommandFiles('./commands').filter(file => !file.endsWith('factUtils.js'));

// Load each command
for (const filePath of commandFiles) {
  const command = require(path.resolve(filePath));
  if (!command.data) {
    console.warn(`Skipping file ${filePath} because it has no command data.`);
    continue;
  }
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const subscribersDataPath = path.join(__dirname, 'subscribers.json');

  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily facts cron job...');
    try {
      await sendDailyFacts(client, subscribersDataPath);
      console.log('✅ Daily facts sent successfully!');
    } catch (error) {
      console.error('❌ Error sending daily facts:', error);
    }
  }, {
    timezone: 'America/New_York' // set your timezone here
  });
});



/** testing DM messageing from bot! */
// client.once('ready', async () => {
//   console.log(`✅ Logged in as ${client.user.tag}`);

//   const testUserId = '487787280610754561';
//   try {
//     const user = await client.users.fetch(testUserId);
//     const { text } = await fetchRandomFact();
//     await user.send(`🧪 Test Fact: ${text}`);
//   } catch (error) {
//     console.warn(`Could not send test DM to user ${testUserId}: ${error.message}`);
//   }

//   // Start your cron after testing
//   cron.schedule('0 8 * * *', () => {
//     sendDailyFacts(client);
//   });
// });


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
