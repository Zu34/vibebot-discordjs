const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Fetches a random inspirational quote'),

  async execute(interaction) {
    try {
      const response = await fetch('https://zenquotes.io/api/random');
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      const data = await response.json();
      const quote = data[0].q;
      const author = data[0].a;

      await interaction.reply(`*"${quote}"*\n— **${author}**`);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      await interaction.reply('❌ Sorry, I couldn’t fetch a quote right now.');
    }
  },
};
