
// commands/reactionroles.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../reactionMessage.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionroles')
    .setDescription('Post a message users can react to for roles.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // ⏳ Defer early to avoid timeout

    const channel = interaction.channel;

    const message = await channel.send('React to get a role:\n🔴 Red Team\n🔵 Blue Team\n🟢 Green Team');

    await message.react('🔴');
    await message.react('🔵');
    await message.react('🟢');

    fs.writeFileSync(filePath, JSON.stringify({ messageId: message.id }));

    interaction.client.reactionRoleMessageId = message.id;

    console.log('📌 Reaction Role Message ID:', message.id);

    await interaction.editReply({ content: '✅ Reaction role message posted!' }); // Respond safely now
  },
};
