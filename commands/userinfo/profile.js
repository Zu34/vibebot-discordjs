
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    data: new SlashCommandBuilder()
      .setName('profile')
      .setDescription('Show user profile.'),
  
    async execute(interaction) {
      const user = interaction.user;
      const userInfo = {
        username: user.username,
        id: user.id,
        joinDate: user.createdAt.toDateString(),
      };
  
      await interaction.reply(`**Username**: ${userInfo.username}\n**User ID**: ${userInfo.id}\n**Account Created On**: ${userInfo.joinDate}`);
    }
  };
  