const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdayPath = path.resolve(__dirname, '../../data/birthdays.json');
if (!fs.existsSync(birthdayPath)) fs.writeFileSync(birthdayPath, '{}', 'utf8');

const birthdays = JSON.parse(fs.readFileSync(birthdayPath, 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Set or view a birthday.')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set your birthday')
        .addStringOption(opt =>
          opt.setName('date')
            .setDescription('Format: YYYY-MM-DD')
            .setRequired(true)
        ))
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View a saved birthday')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('Whose birthday to view?')
            .setRequired(false)
        )),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === 'set') {
      const date = interaction.options.getString('date');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return interaction.reply({ content: '❌ Please use YYYY-MM-DD format.', ephemeral: true });
      }
      birthdays[userId] = date;
      fs.writeFileSync(birthdayPath, JSON.stringify(birthdays, null, 2));
      return interaction.reply(`🎉 Your birthday has been set to **${date}**!`);
    }

    if (sub === 'view') {
      const target = interaction.options.getUser('user') || interaction.user;
      const bday = birthdays[target.id];
      if (!bday) return interaction.reply(`📅 No birthday saved for **${target.username}**.`);
      return interaction.reply(`🎂 **${target.username}**'s birthday is on **${bday}**!`);
    }
  }
};
