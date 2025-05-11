const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Defines a given word')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to define')
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString('word');
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
      const res = await axios.get(apiUrl);
      const definition = res.data[0].meanings[0].definitions[0].definition;
      await interaction.reply(`**Definition of ${word}:** ${definition}`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not find the definition, please try another word.', ephemeral: true });
    }
  },
};
