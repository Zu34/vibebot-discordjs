// commands/subscription/factUtils.js
const fs = require('fs'); 

const axios = require('axios');

async function fetchRandomFact(category) {
  const types = ['trivia', 'math', 'year', 'date'];
  const type = types[Math.floor(Math.random() * types.length)];

  let value;
  if (type === 'date') {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    value = `${month}/${day}`;
  } else if (type === 'year') {
    value = Math.floor(Math.random() * 2025);
  } else {
    value = Math.floor(Math.random() * 500);
  }

  try {
    const res = await axios.get(`http://numbersapi.com/${value}/${type}?json`);
    return { text: res.data.text };
  } catch (err) {
    console.error('❌ Failed to fetch fact:', err);
    return { text: '⚠️ Failed to get a fact. Try again later.' };
  }
}

async function sendDailyFacts(client, dataPath) {
  let subscribersData;
  try {
    subscribersData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error('Failed to read subscribers data:', error);
    return;
  }

  if (!Array.isArray(subscribersData.users)) return;

  for (const userId of subscribersData.users) {
    try {
      const user = await client.users.fetch(userId);
      console.error(`Failed to send daily fact to user ${userId}:`, error);
      const fact = await fetchRandomFact();
      if (!fact || !fact.text) {
        console.warn(`No fact returned for user ${userId}. Skipping.`);
        continue;
      }
      if (typeof userId !== 'string' || !userId.match(/^\d+$/)) {
        console.warn(`⚠️ Invalid user ID format:`, userId);
        continue;
      }
            
      await user.send(`Here is your daily fact: ${fact.text}`);
    } catch (error) {
      console.error(`Failed to send daily fact to user ${userId}:`, error);
    }
  }
}

module.exports = { sendDailyFacts, fetchRandomFact };
