// module.exports = {
//     name: 'voiceStateUpdate',
//     async execute(oldState, newState) {
//       // Ignore bot actions
//       if (newState.member.user.bot) return;
  
//       // Check if the user just joined a voice channel
//       if (!oldState.channel && newState.channel) {
//         const channel = newState.channel;
//         const user = newState.member.user;
  
//         console.log(`${user.tag} joined voice channel: ${channel.name}`);
  
//         // Optionally send a message to a text channel
//         const logChannel = newState.guild.channels.cache.get('YOUR_TEXT_CHANNEL_ID'); // Replace with your log channel ID
//         if (logChannel) {
//           logChannel.send(`🎧 **${user.username}** joined voice channel: **${channel.name}**`);
//         }
//       }
//     },
//   };

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
      const user = newState.member.user;
      const member = newState.member;
      const joinedChannel = newState.channel;
      const logChannel = newState.guild.channels.cache.get('1241169857609859114'); // Text channel to log joins
      const mutedChannelId = '1370874406716309615'; // Replace with your Muted VC ID
  
      // 📌 PART 1: Log when someone joins a VC
      if (!oldState.channel && joinedChannel) {
        if (logChannel) {
          await logChannel.send(`@everyone 🎧 **${user.username}** just joined **${joinedChannel.name}**! Jump in and say hi! 👋`);
        }
      }
  
      // 📌 PART 2: Move server-muted user to Muted VC
      const isNowMuted = newState.serverMute && !oldState.serverMute;
      const isAlreadyInMutedVC = newState.channelId === mutedChannelId;
  
      if (isNowMuted && !isAlreadyInMutedVC) {
        try {
          await member.voice.setChannel(mutedChannelId);
          console.log(`🔇 ${member.user.tag} was server-muted and moved to the Muted VC.`);
        } catch (error) {
          console.error('❌ Failed to move muted member:', error);
        }
      }
    }
  };
  
  
  