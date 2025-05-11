const { SlashCommandBuilder } = require('@discordjs/builders'); // Add this import


module.exports = {
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a user from the server.')
      .addUserOption(option => option.setName('target').setDescription('The user to kick').setRequired(true)),
  
    async execute(interaction) {
      const user = interaction.options.getUser('target');
  
      if (!user) return interaction.reply("Couldn't find that user.");
  
      try {
        await interaction.guild.members.kick(user.id);
        await interaction.reply(`${user.tag} has been kicked.`);
      } catch (error) {
        console.error(error);
        await interaction.reply('There was an error trying to kick that user.');
      }
    }
  };
  