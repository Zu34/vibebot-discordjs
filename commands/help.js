const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get a list of all available commands'),

  async execute(interaction) {
    const helpMessage = `Here are the commands you can use:
    \`/weather\` - Get the current weather in a city.
    \`/forecast\` - Get a 5-day weather forecast for a city.
    \`/airquality\` - Get the air quality information for a city.
    \`/joke\` - Get a random joke.
    \`/quote\` - Get a random motivational quote.
    \`/time\` - Get the current time in a city.
    `;

    await interaction.reply({
      content: helpMessage,
      ephemeral: false
    });
  }
};
