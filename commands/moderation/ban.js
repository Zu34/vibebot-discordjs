// commands/moderation/ban.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

const bansPath = path.join(__dirname, '../../data/bans.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the ban')),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: '⚠️ User not found in this server.', ephemeral: true });
    }

    // DM the user
    try {
      await user.send(`🚫 You have been banned from **${interaction.guild.name}**.\nReason: ${reason}`);
    } catch {
      console.warn(`Could not DM user ${user.tag}`);
    }

    // Ban the user
    try {
      await member.ban({ reason });
    } catch (err) {
      return interaction.reply({ content: `❌ Failed to ban user: ${err.message}`, ephemeral: true });
    }

    // Log to #mod-logs
    const logChannel = interaction.guild.channels.cache.get(config.modLogsChannelId);
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send(`🔨 **${user.tag}** was banned by **${interaction.user.tag}**.\n📝 Reason: ${reason}`);
    }

    // Store ban history
    let bans = {};
    if (fs.existsSync(bansPath)) {
      bans = JSON.parse(fs.readFileSync(bansPath, 'utf8'));
    }

    bans[user.id] = { reason, bannedBy: interaction.user.tag, date: new Date().toISOString() };
    fs.writeFileSync(bansPath, JSON.stringify(bans, null, 2));

    await interaction.reply({ content: `✅ Banned ${user.tag}`, ephemeral: true });
  }
};
