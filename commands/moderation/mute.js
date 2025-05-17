
// commands/moderation/mute.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, parseDuration } = require('discord.js');
const ms = require('ms');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user for a specified time')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true))
    .addStringOption(option =>
      option.setName('duration').setDescription('Mute duration (e.g. 10m, 1h)').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the mute')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to mute members.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const durationMs = ms(durationStr);

    if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) { // max 28 days
      return interaction.reply({ content: '⚠️ Please provide a valid duration under 28 days (e.g., 10m, 2h, 1d)', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '⚠️ User not found in the server.', ephemeral: true });

    try {
      await member.timeout(durationMs, reason);
      const logChannel = interaction.guild.channels.cache.get(config.modLogsChannelId);
      if (logChannel?.isTextBased()) {
        logChannel.send(`🔇 **${user.tag}** was muted for **${durationStr}** by **${interaction.user.tag}**.\n📝 Reason: ${reason}`);
      }
      await interaction.reply({ content: `✅ Muted ${user.tag} for ${durationStr}`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Could not mute user: ${err.message}`, ephemeral: true });
    }
  }
};
