const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Returns the current time'),

  async execute(interaction) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: true });
    await interaction.reply(`🕒 The current UTC time is: **${timeString}**`);
  },
};
