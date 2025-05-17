
// commands/moderation/unban.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a previously banned user')
    .addStringOption(option =>
      option.setName('userid').setDescription('The ID of the user to unban').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to unban members.', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');

    try {
      await interaction.guild.members.unban(userId);
      const logChannel = interaction.guild.channels.cache.get(config.modLogsChannelId);
      if (logChannel?.isTextBased()) {
        logChannel.send(`🟢 <@${userId}> has been **unbanned** by ${interaction.user.tag}`);
      }
      await interaction.reply({ content: `✅ Successfully unbanned user <@${userId}>`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `❌ Could not unban user: ${error.message}`, ephemeral: true });
    }
  }
};
