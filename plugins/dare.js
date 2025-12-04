const axios = require('axios');

module.exports = {
  command: 'dare',
  alias: ['d'],
  category: 'fun',
  description: 'Get a random dare challenge.',

  execute: async (sock, m, ctx) => {
    const { reply } = ctx;

    try {
      // React to show processing
      await sock.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

      // Connect to YOUR API
      const { data } = await axios.get('https://stian-api.vercel.app/api/dare');

      // Validate based on your API's response structure
      if (data && data.status && data.result) {
        
        // Send the Dare challenge
        const message = `*😈 DARE*\n\n"${data.result}"\n\n_© The Stian_`;
        
        await sock.sendMessage(m.chat, { text: message }, { quoted: m });
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      } else {
        reply('❌ Failed to fetch a dare challenge.');
      }

    } catch (err) {
      console.error('Dare Command Error:', err);
      reply('❌ An error occurred connecting to the API.');
    }
  }
};