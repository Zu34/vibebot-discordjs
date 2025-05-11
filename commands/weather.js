const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get the current weather for a city')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('City name')
        .setRequired(true)
    ),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    const axios = require('axios');
    const apiKey = process.env.WEATHER_API_KEY;

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric'
        }
      });

      const weather = res.data;
      await interaction.reply({
        content: `**Weather in ${weather.name}:**
🌡️ Temp: ${weather.main.temp}°C
💧 Humidity: ${weather.main.humidity}%
💨 Wind: ${weather.wind.speed} m/s
🌥️ Condition: ${weather.weather[0].description}`,
        ephemeral: false
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'City not found or API error.', ephemeral: true });
    }
  }
};
