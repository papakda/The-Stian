// plugins/meta-llama.js
const axios = require('axios'); // Ensure you have installed axios: npm install axios

// prevent double-processing if a message re-emits
const processed = new Set();

module.exports = {
  command: 'meta',              // Main command
  alias: ['llama', 'llama3', 'ai'], // Aliases
  description: 'Chat with Llama 3 AI.',
  category: 'ai',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    // 2. Destructure the context
    const { text, reply } = ctx;

    try {
      // 3. De-duplication Logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }
        

      // Check if user provided text
      if (!text) {
          return reply('Please provide a prompt! Example: *.meta Who is The Stian?*');
      }

      // React that the command is processing
      await sock.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });

      const apiUrl = `https://apis.davidcyriltech.my.id/ai/llama3?text=${encodeURIComponent(text)}&apikey=`;

      // Fetch the data
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Check if the API request was successful
      if (data && data.success && data.message) {
          // Send the AI response
          await sock.sendMessage(m.chat, { text: data.message }, { quoted: m });
          
          // React Success
          await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } else {
          // Handle API failure (e.g., if the server is down)
          reply('⚠️ The AI could not process your request at this time.');
          await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      }

// THE STIAN

    } catch (err) {
      // 4. Error Handling
      console.error('Llama 3 Command error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ An error occurred while communicating with the API.');
    }
  }
};