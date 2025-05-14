
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomfact')
    .setDescription('Get a random number/date/year/math fact with a button to get more!')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Choose a trivia category')
        .setRequired(false)
        .addChoices(
          { name: 'General Knowledge', value: '9' },
          { name: 'Sports', value: '21' },
          { name: 'Science', value: '17' },
          { name: 'Entertainment', value: '11' },
          { name: 'History', value: '23' },
        )
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category') || '9'; // Default to General Knowledge
    const factData = await fetchRandomFact(category);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('another_fact')
        .setLabel('🔁 Another Fact')
        .setStyle(ButtonStyle.Primary)
    );

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('category_select')
        .setPlaceholder('Select a new category')
        .addOptions(
          { label: 'General Knowledge', value: '9' },
          { label: 'Sports', value: '21' },
          { label: 'Science', value: '17' },
          { label: 'Entertainment', value: '11' },
          { label: 'History', value: '23' }
        )
    );

    const sentMessage = await interaction.reply({
      content: `🎲 **Random ${factData.type} fact about \`${factData.value}\`**:\n${factData.text}`,
      embeds: factData.embed ? [factData.embed] : [],
      components: [row, selectMenu],
      fetchReply: true,
    });

    const collector = sentMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'another_fact') {
        const newFact = await fetchRandomFact(category);
        await i.update({
          content: `🎲 **Random ${newFact.type} fact about \`${newFact.value}\`**:\n${newFact.text}`,
          embeds: newFact.embed ? [newFact.embed] : [],
          components: [row, selectMenu],
        });

        // 🟡 Wait 2 seconds before showing feedback
        setTimeout(() => sendFeedbackPrompt(i, sentMessage), 2000);
      }

      if (i.customId === 'category_select') {
        const newCategory = i.values[0];
        const newFact = await fetchRandomFact(newCategory);
        await i.update({
          content: `🎲 **Random ${newFact.type} fact about \`${newFact.value}\`**:\n${newFact.text}`,
          embeds: newFact.embed ? [newFact.embed] : [],
          components: [row, selectMenu],
        });

        // 🟡 Wait 2 seconds before showing feedback
        setTimeout(() => sendFeedbackPrompt(i, sentMessage), 2000);
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] });
    });
  },
};

// Fetch the random fact from the NumbersAPI
async function fetchRandomFact(category) {
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

  let factText = '';
  let embed = null;

  try {
    const res = await axios.get(`http://numbersapi.com/${value}/${type}?json`);
    factText = res.data.text;

    if (type === 'trivia') {
      embed = {
        color: 0x0099ff,
        title: `Did you know?`,
        description: factText,
        image: { url: 'https://source.unsplash.com/600x200/?fun,facts' },
        footer: { text: `Category: Trivia` },
      };
    }

    return { text: factText, type, value, embed };
  } catch (err) {
    console.error('❌ Failed to fetch fact:', err);
    return {
      type: 'error',
      value: 'N/A',
      text: '⚠️ Failed to get a fact. Try again later.',
    };
  }
}

// Function to prompt for feedback
async function sendFeedbackPrompt(interaction, sentMessage) {
    const feedbackMessage = await interaction.followUp({
      content: 'Did you like this fact? React with 👍 for Yes or 👎 for No!',
    });
  
    // Add feedback reactions (👍 and 👎) to the feedback message
    await feedbackMessage.react('👍');
    await feedbackMessage.react('👎');
  
    // Create a reaction collector to capture feedback reactions
    const feedbackCollector = feedbackMessage.createReactionCollector({
      filter: (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name) && user.id !== interaction.client.user.id,
      time: 60000, // Collect for 60 seconds
    });
  
    // Handle feedback collection
    feedbackCollector.on('collect', (reaction, user) => {
      if (reaction.emoji.name === '👍') {
        interaction.followUp({ content: `${user.tag} liked the fact! 🎉` }); // Use `interaction.followUp` for feedback
      } else if (reaction.emoji.name === '👎') {
        interaction.followUp({ content: `${user.tag} didn’t like the fact. 😕` }); // Use `interaction.followUp` for feedback
      }
    });
  
    feedbackCollector.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.followUp({ content: 'No feedback received. Hope you enjoyed the fact anyway! 😊' }); // Use `interaction.followUp` for final message
      }
    });
  }
  
