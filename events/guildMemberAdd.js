// // events/guildMemberAdd.js
// const axios = require('axios');

// module.exports = {
//   name: 'guildMemberAdd',
//   async execute(member) {
//     const welcomeChannelId = 'YOUR_CHANNEL_ID_HERE'; // Replace with your welcome channel ID
//     const channel = member.guild.channels.cache.get(welcomeChannelId);

//     if (!channel) return;

//     try {
//       const response = await axios.get('https://api.quotable.io/random');
//       const quote = response.data.content;

//       const welcomeMessage = `
// 👋 Welcome, <@${member.id}>!
// 🎉 We're thrilled to have you in **${member.guild.name}**!

// 📜 Be sure to check out <#rules-channel-id> and <#introductions-channel-id>!
// 💬 Join the chat in <#general-channel-id>.

// 💡 *"${quote}"*

// Enjoy your stay! 🚀
//       `;

//       channel.send(welcomeMessage);
//     } catch (error) {
//       console.error('Failed to fetch quote or send welcome message:', error);
//     }
//   }
// };

const axios = require('axios');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const welcomeChannelId = '1241169857609859114'; // Replace with your actual welcome channel ID
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) return;

    // If the new member is a bot
    if (member.user.bot) {
      try {
        const jokeRes = await axios.get('https://official-joke-api.appspot.com/jokes/programming/random');
        const joke = jokeRes.data[0];
        const jokeText = `${joke.setup} ${joke.punchline}`;

        const botWelcomeMessage = `
@everyone 🤖 A new bot, **${member.user.tag}**, has joined the server! let's welcome Buddy 🎉!

💡 Programming joke of the moment:
> ${jokeText}

📌 Try \`/help\` or check its documentation to see what it can do!

🚀 Let's see some automation magic!
        `;

        await channel.send(botWelcomeMessage);
      } catch (error) {
        console.error('Failed to fetch joke or send bot welcome message:', error);
      }

      return; // Skip the regular welcome message for bots
    }
    // Otherwise, proceed with the regular welcome message for humans
    try {
      // Fetch a random quote from the quotable API
      const response = await axios.get('https://api.quotable.io/random');
      const quote = response.data.content; // Get the quote text from the API response

      // Create a custom welcome message
      const welcomeMessage = `
👋 Welcome, <@${member.id}>!
🎉 We're thrilled to have you in **${member.guild.name}**!

📜 Be sure to check out <#rules-channel-id> and <#introductions-channel-id>!
💬 Join the chat in <#general-channel-id>.

💡 *"${quote}"*

Enjoy your stay! 🚀
      `;

      // Send the welcome message to the specified channel
      channel.send(welcomeMessage);
    } catch (error) {
      console.error('Failed to fetch quote or send welcome message:', error);
    }
  },
};
