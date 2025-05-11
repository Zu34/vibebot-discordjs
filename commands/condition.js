const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('condition')
    .setDescription('Get current weather condition for a city')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('City name')
        .setRequired(true)
    ),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    const apiKey = process.env.WEATHER_API_KEY;

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric'
        }
      });

      const condition = res.data.weather[0].description;
      await interaction.reply(`🌥️ Weather condition in ${city}: ${condition}`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'City not found or API error.', ephemeral: true });
    }
  }
};
