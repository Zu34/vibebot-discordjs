
const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  const fs = require('fs');
  const path = require('path');
  
  const leaderboardPath = path.resolve(__dirname, '../../../data/tictactoe_leaderboard.json');
  
  if (!fs.existsSync(leaderboardPath) || fs.readFileSync(leaderboardPath, 'utf8').trim() === '') {
    fs.writeFileSync(leaderboardPath, JSON.stringify({}), 'utf8');
  }
  
  const emptyBoard = () => Array(9).fill(null);
  
  const getBoardComponents = (board, disabled = false) => {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const row = new ActionRowBuilder();
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        const value = board[index];
        let button = new ButtonBuilder()
          .setCustomId(index.toString())
          .setLabel('➖')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled || value !== null);
  
        if (value === 'X') button.setLabel('❌').setStyle(ButtonStyle.Danger);
        if (value === 'O') button.setLabel('⭕').setStyle(ButtonStyle.Primary);
  
        row.addComponents(button);
      }
      rows.push(row);
    }
    return rows;
  };
  
  const checkWin = (board, player) => {
    const wins = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6],
    ];
    return wins.some(p => p.every(i => board[i] === player));
  };
  
  const checkDraw = board => board.every(cell => cell);
  
  const findBestMove = board => {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6],
    ];
  
    for (const [a, b, c] of lines) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(x => x === 'O').length === 2 && line.includes(null))
        return [a, b, c].find(i => board[i] === null);
      if (line.filter(x => x === 'X').length === 2 && line.includes(null))
        return [a, b, c].find(i => board[i] === null);
    }
  
    const corners = [0, 2, 6, 8].filter(i => board[i] === null);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  
    const center = board[4] === null ? 4 : null;
    if (center !== null) return center;
  
    const sides = [1, 3, 5, 7].filter(i => board[i] === null);
    if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  
    return board.findIndex(x => x === null);
  };
  
  const updateLeaderboard = (userId, username, won) => {
    const lb = JSON.parse(fs.readFileSync(leaderboardPath));
    if (!lb[userId]) lb[userId] = { username, wins: 0, losses: 0 };
    if (won) lb[userId].wins++;
    else lb[userId].losses++;
    fs.writeFileSync(leaderboardPath, JSON.stringify(lb, null, 2));
  };
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('tictactoe')
      .setDescription('Play Tic-Tac-Toe vs a smart bot (best of 3).'),
  
    async execute(interaction) {
      const userId = interaction.user.id;
      const username = interaction.user.username;
  
      let board, userScore, botScore, round, collector;
  
      const playAgainButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('play_again')
          .setLabel('🔄 Play Again')
          .setStyle(ButtonStyle.Success)
      );
  
      const startNewGame = async () => {
        board = emptyBoard();
        userScore = 0;
        botScore = 0;
        round = 1;
  
        if (collector) collector.stop();
  
        collector = interaction.channel.createMessageComponentCollector({ time: 120000 });
  
        collector.on('collect', async i => {
          if (i.user.id !== userId) return i.reply({ content: '🚫 Not your game!', ephemeral: true });
  
          if (i.customId === 'play_again') {
            await i.deferUpdate();
            await startNewGame();
            return;
          }
  
          const idx = parseInt(i.customId);
          if (board[idx]) return i.reply({ content: '⚠️ Already filled!', ephemeral: true });
  
          board[idx] = 'X';
  
          // User win check
          if (checkWin(board, 'X')) {
            userScore++;
            if (userScore === 2) {
              updateLeaderboard(userId, username, true);
              collector.stop();
              return i.update({
                content: `🏆 **You win the match! Final Score: ${userScore}-${botScore}**`,
                components: [playAgainButton]
              });
            }
            board = emptyBoard();
            round++;
            await i.update({
              content: `✅ **You won round ${round - 1}!**\n\nScore: ${userScore}-${botScore}`,
              components: getBoardComponents(board, true)
            });
            setTimeout(() => sendRoundMessage(i), 1500);
            return;
          }
  
          // Draw check
          if (checkDraw(board)) {
            board = emptyBoard();
            round++;
            await i.update({
              content: `🤝 **Round ${round - 1} drawn.**\n\nScore: ${userScore}-${botScore}`,
              components: getBoardComponents(board, true)
            });
            setTimeout(() => sendRoundMessage(i), 1500);
            return;
          }
  
          // Bot move
          const botMove = findBestMove(board);
          board[botMove] = 'O';
  
          // Bot win check
          if (checkWin(board, 'O')) {
            botScore++;
            if (botScore === 2) {
              updateLeaderboard(userId, username, false);
              collector.stop();
              return i.update({
                content: `💀 **Bot wins the match! Final Score: ${userScore}-${botScore}**`,
                components: [playAgainButton]
              });
            }
            board = emptyBoard();
            round++;
            await i.update({
              content: `❌ **Bot won round ${round - 1}!**\n\nScore: ${userScore}-${botScore}`,
              components: getBoardComponents(board, true)
            });
            setTimeout(() => sendRoundMessage(i), 1500);
            return;
          }
  
          // Draw check after bot move
          if (checkDraw(board)) {
            board = emptyBoard();
            round++;
            await i.update({
              content: `🤝 **Round ${round - 1} drawn.**\n\nScore: ${userScore}-${botScore}`,
              components: getBoardComponents(board, true)
            });
            setTimeout(() => sendRoundMessage(i), 1500);
            return;
          }
  
          // Continue playing
          await i.update({
            content: `🎮 Round ${round} — Your turn!\n\nScore: ${userScore}-${botScore}`,
            components: getBoardComponents(board)
          });
        });
  
        collector.on('end', async (_, reason) => {
          if (reason === 'time') {
            await interaction.editReply({
              content: '⌛ Game ended due to inactivity.',
              components: getBoardComponents(board, true)
            });
          }
        });
  
        const sendRoundMessage = async (i) => {
          await i.followUp({
            content: `🎮 **Round ${round} — You are ❌**\n\nScore: You ${userScore} - ${botScore} Bot`,
            components: getBoardComponents(board),
            ephemeral: false
          });
        };
  
        // Initial game start message
        await interaction.editReply({
          content: `🎮 **Round ${round} — You are ❌**\n\nScore: You ${userScore} - ${botScore} Bot`,
          components: getBoardComponents(board)
        });
      };
  
      await interaction.reply({ content: '🎮 Starting Tic-Tac-Toe vs Bot. First to 2 wins.', ephemeral: false });
  
      await startNewGame();
    }
  };
  