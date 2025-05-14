

const { SlashCommandBuilder } = require('discord.js');

const compliments = [
  "You are amazing!",
  "You're a true legend!",
  "You light up the room!",
  "Keep being awesome!",
  "You're incredible, don't forget that!"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about yourself and a compliment!'),

  async execute(interaction) {
    const user = interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const server = interaction.guild;

    // Get the user's status if available
    const userStatus = member.presence ? member.presence.status : 'Offline';

    // Random compliment
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    await interaction.reply({
      content: `**Your username**: ${user.username}\n**Your ID**: ${user.id}\n**Your Avatar**: ${user.displayAvatarURL()}\n**Account Created On**: ${user.createdAt.toDateString()}\n**Joined Server On**: ${member.joinedAt.toDateString()}\n**Your Status**: ${userStatus}\n**Compliment**: ${compliment}\n\n**Server Name**: ${server.name}\n**Server Region**: ${server.region}\n**Total Members**: ${server.memberCount}`,
      ephemeral: false
    });
  }
};
