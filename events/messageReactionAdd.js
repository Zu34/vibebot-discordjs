


const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const reactionDataPath = path.join(__dirname, '..', 'reactionMessage.json');
const { messageId, channelId } = JSON.parse(fs.readFileSync(reactionDataPath, 'utf8'));

const emojiRoleMap = {
  '🚺': '1371560724568080465',
  '🚹': '1371561017091424359',
  '⚪': '1371561132426530976',
};

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (reaction.message.id !== messageId || reaction.message.channelId !== channelId) return;
    if (user.bot) return;

    const roleId = emojiRoleMap[reaction.emoji.name];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    await member.roles.add(roleId).catch(console.error);
    console.log(`✅ Added role ${roleId} to ${user.tag}`);
  },
};
