const axios = require('axios');

module.exports = {
  command: 'truth',
  alias: ['t'],
  category: 'fun',
  description: 'Get a random truth question.',

  execute: async (sock, m, ctx) => {
    const { reply } = ctx;

    try {
      // React to show processing
      await sock.sendMessage(m.chat, { react: { text: '🤔', key: m.key } });

      // Connect to YOUR API
      const { data } = await axios.get('https://stian-api.vercel.app/api/truth');

      // Validate based on your API's response structure
      if (data && data.status && data.result) {
        
        // Send the Truth question
        const message = `*🔮 TRUTH*\n\n"${data.result}"\n\n_© The Stian_`;
        
        await sock.sendMessage(m.chat, { text: message }, { quoted: m });
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      } else {
        reply('❌ Failed to fetch a truth question.');
      }

    } catch (err) {
      console.error('Truth Command Error:', err);
      reply('❌ An error occurred connecting to the API.');
    }
  }
};