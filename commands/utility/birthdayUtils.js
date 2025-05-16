
// commands/utility/birthdayUtils.js
const fs = require('fs');
const path = require('path');

const birthdayPath = path.join(__dirname, '../../data/birthdays.json');

async function checkAndCelebrateBirthdays(client) {
  console.log('🎂 Checking birthdays...');
  if (!fs.existsSync(birthdayPath)) return;

  const today = new Date().toISOString().slice(5, 10); // MM-DD
  const birthdays = JSON.parse(fs.readFileSync(birthdayPath, 'utf8'));

  for (const guild of client.guilds.cache.values()) {
    for (const [userId, birthdate] of Object.entries(birthdays)) {
      const [year, month, day] = birthdate.split('-');
      const userBirthday = `${month}-${day}`;

      if (userBirthday === today) {
        try {
          const member = await guild.members.fetch(userId).catch(() => null);
          if (!member) continue;

          const age = new Date().getFullYear() - parseInt(year);

          // 🧁 Assign Birthday Role
          const roleName = '🎂 Birthday';
          let birthdayRole = guild.roles.cache.find(r => r.name === roleName);

          if (!birthdayRole) {
            birthdayRole = await guild.roles.create({
              name: roleName,
              color: 'FUCHSIA',
              reason: 'Birthday role for special members 🎉',
            });
          }

          await member.roles.add(birthdayRole);

          // Remove after 24 hours
          setTimeout(async () => {
            await member.roles.remove(birthdayRole).catch(() => {});
          }, 24 * 60 * 60 * 1000);

          // 🎁 DM
          try {
            await member.send(`🎉 Happy Birthday, ${member.displayName}!\nYou're now **${age}**! 🎂`);
          } catch (e) {
            console.warn(`Couldn't DM ${userId}:`, e.message);
          }

          // 🎉 Server Shoutout
          if (guild.systemChannel) {
            guild.systemChannel.send(`🎊 It's <@${userId}>'s birthday today! Wish them a fantastic **${age}th** birthday! 🥳`);
          }

        } catch (e) {
          console.error(`❌ Error celebrating birthday for ${userId}:`, e);
        }
      }
    }
  }
}

module.exports = { checkAndCelebrateBirthdays };
