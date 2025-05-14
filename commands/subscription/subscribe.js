

const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const { sendDailyFacts } = require('../subscription/factUtils');  // Updated import

const dataPath = path.join(__dirname, '..', '..', 'data', 'subscribers.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribefacts')
    .setDescription('Subscribe to daily random facts via DM.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Load or initialize subscribers data
    let subscribersData;
    try {
      subscribersData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      console.error('Failed to read subscribers data:', error);
      subscribersData = { users: [] };
    }

    if (!Array.isArray(subscribersData.users)) {
      subscribersData.users = [];
    }

    if (!subscribersData.users.includes(userId)) {
      subscribersData.users.push(userId);
      try {
        fs.writeFileSync(dataPath, JSON.stringify(subscribersData, null, 2));
        await interaction.reply('You have successfully subscribed to daily facts! 🎉');
      } catch (error) {
        console.error('Failed to save subscribers data:', error);
        await interaction.reply('❌ Error saving subscription data.');
      }
    } else {
      await interaction.reply('You are already subscribed to daily facts. 😊');
    }
  },
};
