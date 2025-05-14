

// events/messageReactionAdd.js
// const fs = require('fs');
// const path = require('path');
// const filePath = path.join(__dirname, '../reactionMessage.json');


// module.exports = {
//   name: 'messageReactionAdd',
//   async execute(reaction, user) {
//     console.log(`📥 Reaction detected from ${user.tag} on emoji: ${reaction.emoji.name}`);

//     if (reaction.partial) {
//       try {
//         await reaction.fetch();
//       } catch (error) {
//         console.error('❌ Failed to fetch partial reaction:', error);
//         return;
//       }
//     }

//     if (user.bot) return;

//     const { message, emoji } = reaction;
//     const { guild, client } = message;

//     if (client.reactionRoleMessageId !== message.id) {
//       console.log(`⛔ Ignored reaction on message ${message.id} (expected ${client.reactionRoleMessageId})`);
//       return;
//     }

//     const roleMap = {
//       '🔴': '1371560724568080465',
//       '🔵': '1371561017091424359',
//       '🟢': '1371561132426530976',
//     };

//     const roleId = roleMap[emoji.name];
//     if (!roleId) {
//       console.log(`⚠️ Unknown emoji: ${emoji.name}`);
//       return;
//     }

//     try {
//       const member = await guild.members.fetch(user.id);
//       await member.roles.add(roleId);
//       console.log(`✅ Gave ${emoji.name} role to ${user.tag}`);
//     } catch (err) {
//       console.error('❌ Error assigning role:', err);
//     }
//   },
// };



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
