
module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
      const user = newState.member.user;
      const member = newState.member;
      const joinedChannel = newState.channel;
      const logChannel = newState.guild.channels.cache.get('1241169857609859114'); // Text channel to log joins
      const mutedChannelId = '1370874406716309615'; 
  
      
      if (!oldState.channel && joinedChannel) {
        if (logChannel) {
          await logChannel.send(`@everyone 🎧 **${user.username}** just joined **${joinedChannel.name}**! Jump in and say hi! 👋`);
        }
      }
  
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
  
  
  