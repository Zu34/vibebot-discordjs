const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const channelId = '1243029817956241480'; // Replace with your actual channel ID
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
      console.error("❌ Channel not found.");
      return;
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('role_female').setLabel('♀️ Female').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('role_male').setLabel('♂️ Male').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('role_other').setLabel('⚪ Other').setStyle(ButtonStyle.Secondary),
      );

    const sentMessage = await channel.send({
      content: 'Click a button to get your role:',
      components: [row],
    });

    // Save message ID to file
    const data = {
      messageId: sentMessage.id,
      channelId: sentMessage.channel.id
    };

    fs.writeFileSync(path.join(__dirname, '../reactionMessage.json'), JSON.stringify(data, null, 2));
    console.log("✅ Sent role message and saved its ID.");
  }
};
