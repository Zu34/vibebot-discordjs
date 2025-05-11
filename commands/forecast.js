const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forecast')
    .setDescription('Get a 5-day weather forecast for a city')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('City name')
        .setRequired(true)
    ),

  async execute(interaction) {
    const city = interaction.options.getString('city');
    const apiKey = process.env.WEATHER_API_KEY;

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric'
        }
      });

      const forecast = res.data.list.slice(0, 5); // Get the first 5 forecasts
      let forecastText = `**5-day Forecast for ${city}:**\n`;

      forecast.forEach(day => {
        const date = new Date(day.dt * 1000);
        forecastText += `\n**${date.toLocaleDateString()}**:
        🌡️ Temp: ${day.main.temp}°C
        💧 Humidity: ${day.main.humidity}%
        🌥️ Condition: ${day.weather[0].description}`;
      });

      await interaction.reply({
        content: forecastText,
        ephemeral: false
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'City not found or API error.', ephemeral: true });
    }
  }
};
