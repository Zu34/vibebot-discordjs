// commands/fun/trivia.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const axios = require('axios');
const config = require('../../reactionMessage.json'); // Load the message/channel IDs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Ask a random trivia question!'),

  async execute(interaction) {
    try {
      const triviaChannelId = config.gameschannelId;
      const triviaChannel = await interaction.client.channels.fetch(triviaChannelId);

      const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      console.log('📦 API response:', response.data);
      
      const q = response.data.results[0];

      const question = decodeHTML(q.question);
      const correctAnswer = decodeHTML(q.correct_answer);
      const options = [...q.incorrect_answers.map(decodeHTML), correctAnswer];

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      const row = new MessageActionRow().addComponents(
        options.map(option =>
          new MessageButton()
            .setCustomId(option)
            .setLabel(option)
            .setStyle('PRIMARY')
        )
      );

      const sentMessage = await triviaChannel.send({
        content: `🧠 **Trivia Time!**\n${question}`,
        components: [row],
      });

      const filter = i => i.isButton();
      const collector = sentMessage.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async i => {
        const isCorrect = i.customId === correctAnswer;
        await i.reply({ content: isCorrect ? '✅ Correct!' : `❌ Wrong! Correct answer: **${correctAnswer}**`, ephemeral: true });
        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          sentMessage.edit({ content: `⏰ Time's up!\n**Answer:** ${correctAnswer}`, components: [] });
        } else {
          sentMessage.edit({ components: [] }); // Disable buttons
        }
      });

    } catch (err) {
      console.error('❌ Trivia fetch error:', err);  // more detail
      await interaction.reply({
        content: '⚠️ Failed to fetch trivia question. Please try again later.',
        ephemeral: true,
      });
    }
    
  },
};

// Decode HTML entities from API
function decodeHTML(html) {
  return html.replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&eacute;/g, 'é');
}
