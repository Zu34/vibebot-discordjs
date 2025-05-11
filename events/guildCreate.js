module.exports = {
    name: 'guildCreate',
    once: true,
    async execute(guild) {
      console.log(`Bot has joined a new server: ${guild.name}`);
  
      // Send a welcome message to the system channel of the server
      const channel = guild.systemChannel;
      if (channel) {
        channel.send(`Thanks for adding me to **${guild.name}**! Feel free to check out my commands.`);
      } else {
        console.log('No system channel found!');
      }
    },
  };
  