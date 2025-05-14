const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const roleMap = {
      role_female: '1371560724568080465',
      role_male: '1371561017091424359',
      role_other: '1371561132426530976',
    };

    const roleId = roleMap[interaction.customId];

    if (!roleId) return;

    const member = interaction.member;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      await interaction.reply({ content: '❌ Role removed.', ephemeral: true });
    } else {
      await member.roles.add(roleId);
      await interaction.reply({ content: '✅ Role added.', ephemeral: true });
    }
  }
};
