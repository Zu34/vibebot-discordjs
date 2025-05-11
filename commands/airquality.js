const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('airquality')
    .setDescription('Get air quality information for a city')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('City name')
        .setRequired(true)
    ),

  async execute(interaction) {
    const city = interaction.options.getString('city');
    const apiKey = process.env.WEATHER_API_KEY; // Make sure to set this in your environment variables

    try {
      // Fetching the city coordinates first
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: city,
          appid: apiKey
        }
      });

      const lat = res.data.coord.lat;
      const lon = res.data.coord.lon;

      // Now, use the coordinates to fetch air quality data
      const airQualityRes = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
        params: {
          lat: lat,
          lon: lon,
          appid: apiKey
        }
      });

      const airQualityData = airQualityRes.data.list[0].components;
      await interaction.reply({
        content: `**Air Quality in ${city}:**
        🌫️ PM2.5: ${airQualityData['pm2_5']} µg/m³
        🌫️ PM10: ${airQualityData['pm10']} µg/m³
        🌫️ CO: ${airQualityData['co']} µg/m³
        🌫️ NO2: ${airQualityData['no2']} µg/m³
        🌫️ O3: ${airQualityData['o3']} µg/m³
        🌫️ SO2: ${airQualityData['so2']} µg/m³`,
        ephemeral: false
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'City not found or API error.', ephemeral: true });
    }
  }
};
