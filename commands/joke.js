const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tells you a random joke'),

  async execute(interaction) {
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      const joke = await response.json();

      await interaction.reply(`😂 ${joke.setup}\n\n||${joke.punchline}||`);
    } catch (error) {
      console.error('Failed to fetch joke:', error);
      await interaction.reply('😞 Failed to fetch a joke right now. Try again later.');
    }
  },
};
