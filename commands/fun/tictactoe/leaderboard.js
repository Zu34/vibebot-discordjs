const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const leaderboardPath = path.resolve(__dirname, '../../../data/tictactoe_leaderboard.json');

function getRankEmoji(wins) {
  if (wins >= 10) return '🥇';
  if (wins >= 5) return '🥈';
  if (wins >= 1) return '🥉';
  return '😶';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe_leaderboard')
    .setDescription('View the top Tic-Tac-Toe players!'),

  async execute(interaction) {
    if (!fs.existsSync(leaderboardPath)) {
      return interaction.reply({ content: '📉 Leaderboard not found.', ephemeral: true });
    }

    const data = JSON.parse(fs.readFileSync(leaderboardPath, 'utf8'));
    const sorted = Object.entries(data)
      .sort(([, a], [, b]) => b.wins - a.wins)
      .slice(0, 10); // top 10

    const leaderboardText = sorted.map(([id, player], index) => {
      const rank = getRankEmoji(player.wins);
      return `**${index + 1}. ${rank} ${player.username}** — 🏆 ${player.wins} Wins | ❌ ${player.losses} Losses`;
    }).join('\n') || 'No players yet. Be the first to win!';

    const embed = new EmbedBuilder()
      .setTitle('🏆 Tic-Tac-Toe Leaderboard')
      .setDescription(leaderboardText)
      .setColor('#00AAFF')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
