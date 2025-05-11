// commands/ping.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping') // Slash command name: /ping
    .setDescription('Replies with Pong!'), // Description shown in Discord

  async execute(interaction) {
    // What happens when someone uses /ping
    await interaction.reply('Pong!');
  },

  
};
