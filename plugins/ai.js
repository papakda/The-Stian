// plugins/gpt4-mini.js
const axios = require('axios');

// prevent double-processing if a message re-emits
const processed = new Set();

module.exports = {
  // 1. Command Settings
  command: 'gpt4',              // Main command
  alias: ['gpt', 'gpt4omini', 'mini'], // Aliases
  description: 'Chat with GPT-4o Mini (via David Cyril Tech API).',
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
          return reply('Please provide a prompt! Example: *.gpt4 Write a poem about coding.*');
      }

      // React that the command is processing
      await sock.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

      const apiUrl = `https://apis.davidcyriltech.my.id/ai/gpt4omini?text=${encodeURIComponent(text)}&apikey=`;

      // Fetch the data
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data && data.success && data.response) {
          // Send the AI response
          await sock.sendMessage(m.chat, { text: data.response }, { quoted: m });
          
          // React Success
          await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } else {
          // Handle API failure
          reply('⚠️ The AI could not process your request at this time.');
          await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      }

      // --- THE STIAN ---

    } catch (err) {
      // 4. Error Handling
      console.error('GPT-4 Mini Command error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ An error occurred while communicating with the API.');
    }
  }
};