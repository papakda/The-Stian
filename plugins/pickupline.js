const axios = require('axios');

// prevent double-processing
const processed = new Set();

module.exports = {
  command: 'pickupline',
  alias: ['pickup', 'rizz', 'line'],
  description: 'Get a cheesy pickup line to impress (or annoy) someone.',
  category: 'fun',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { reply } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 2000);
      }

      // 1) Determine target (Optional: tag someone to use the line on them)
      let targetJid = null;
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
      } else if (m.quoted) {
        targetJid = m.quoted.sender;
      }

      // React loading
      await sock.sendMessage(m.chat, { react: { text: '💘', key: m.key } });

      // 2) Fetch Data from API
      const { data } = await axios.get('https://apis.davidcyriltech.my.id/pickupline');

      if (!data || !data.pickupline) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply('❌ Failed to fetch a pickup line. API might be down.');
      }

      const line = data.pickupline;

      // 3) Send Message
      if (targetJid) {
        // If targeting someone: "Hey @User, [Pickup Line]"
        await sock.sendMessage(
          m.chat,
          {
            text: `Hey @${targetJid.split('@')[0]},\n\n${line} 😘`,
            mentions: [targetJid]
          },
          { quoted: m }
        );
      } else {
        // Just send the line normally
        reply(`*${line}*`);
      }

      // Done
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('Pickupline error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ An error occurred while fetching the pickup line.');
    }
  }
};