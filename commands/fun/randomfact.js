const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomfact')
    .setDescription('Get a random number/date/year/math fact with a button to get more!'),

  async execute(interaction) {
    const factData = await fetchRandomFact();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('another_fact')
        .setLabel('🔁 Another Fact')
        .setStyle(ButtonStyle.Primary)
    );

    const sentMessage = await interaction.reply({
      content: `🎲 **Random ${factData.type} fact about \`${factData.value}\`**:\n${factData.text}`,
      components: [row],
      fetchReply: true,
    });

    const collector = sentMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'another_fact') {
        const newFact = await fetchRandomFact();
        await i.update({
          content: `🎲 **Random ${newFact.type} fact about \`${newFact.value}\`**:\n${newFact.text}`,
          components: [row],
        });
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] });
    });
  },
};

async function fetchRandomFact() {
  const types = ['trivia', 'math', 'year', 'date'];
  const type = types[Math.floor(Math.random() * types.length)];

  let value;
  if (type === 'date') {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    value = `${month}/${day}`;
  } else if (type === 'year') {
    value = Math.floor(Math.random() * 2025);
  } else {
    value = Math.floor(Math.random() * 500);
  }

  try {
    const res = await axios.get(`http://numbersapi.com/${value}/${type}?json`);
    return { ...res.data, type, value };
  } catch (err) {
    console.error('❌ Failed to fetch fact:', err);
    return {
      type: 'error',
      value: 'N/A',
      text: '⚠️ Failed to get a fact. Try again later.',
    };
  }
}
