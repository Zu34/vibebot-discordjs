module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
      // Ensure the reaction is on the correct message
      if (reaction.message.author.bot) return; // Ignore bot reactions
      if (reaction.partial) await reaction.fetch(); // Handle partial reactions
  
      // Check if the message is the one with reaction roles
      const reactionRolesMessageId = 'your_message_id'; // The ID of the message sent by the bot with the reaction roles
      if (reaction.message.id !== reactionRolesMessageId) return;
  
      const roleMap = {
        '👍': 'RoleID1', // Emoji '👍' gives Role 1
        '👎': 'RoleID2', // Emoji '👎' gives Role 2
      };
  
      // Get the role to assign based on the emoji
      const roleId = roleMap[reaction.emoji.name];
      if (!roleId) return; // If no role is mapped to the emoji, exit
  
      try {
        const member = await reaction.message.guild.members.fetch(user.id);
        const role = await reaction.message.guild.roles.fetch(roleId);
  
        if (member && role) {
          await member.roles.add(role);
          console.log(`${user.tag} has been assigned the ${role.name} role!`);
        }
      } catch (error) {
        console.error('Failed to assign role:', error);
      }
    },
  };
  