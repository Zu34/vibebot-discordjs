const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('numberfact')
    .setDescription('Get a fun fact about a number!')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of fact')
        .addChoices(
          { name: 'trivia', value: 'trivia' },
          { name: 'math', value: 'math' },
          { name: 'date (MM/DD)', value: 'date' },
          { name: 'year', value: 'year' }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Number, date (e.g., 2/29), or "random"')
        .setRequired(true)),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const value = interaction.options.getString('value');

    try {
      const url = `http://numbersapi.com/${value}/${type}?json`;

      const response = await axios.get(url);
      const fact = response.data.text;

      await interaction.reply(`🔢 **Fact:** ${fact}`);
    } catch (error) {
      console.error('❌ Numbers API error:', error);
      await interaction.reply({ content: 'Failed to fetch a number fact. Please try again.', ephemeral: true });
    }
  },
};
