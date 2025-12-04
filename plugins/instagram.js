// plugins/dl-instagram.js
const { igdl } = require('ruhend-scraper');

// prevent double-processing if a message re-emits
const processed = new Set();

module.exports = {
  command: 'instagram',
  alias: ['ig', 'insta', 'igdl'],
  description: 'Download Instagram post/reel/video from a link or a replied message.',
  category: 'downloader',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx  // { args, text, q, quoted, mime, qmsg, reply, ... }
   */
  execute: async (sock, m, ctx) => {
    const { args, text, q, quoted, qmsg, reply } = ctx;

    try {
      // de-dup
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      // 1) get URL from args / q / text
      let url = (q || text || (Array.isArray(args) && args.join(' ')) || '').trim();

      // 2) fallback: try quoted content/caption
      if (!url && quoted) {
        const msg = qmsg || quoted?.text || quoted?.caption || quoted?.message;
        if (typeof msg === 'string') url = msg.trim();
        else if (msg?.caption) url = String(msg.caption).trim();
      }

      // 3) validate
      const patterns = [
        /https?:\/\/(?:www\.)?instagram\.com\//i,
        /https?:\/\/(?:www\.)?instagr\.am\//i,
        /https?:\/\/(?:www\.)?instagram\.com\/p\//i,
        /https?:\/\/(?:www\.)?instagram\.com\/reel\//i,
        /https?:\/\/(?:www\.)?instagram\.com\/tv\//i
      ];
      const valid = url && patterns.some(r => r.test(url));

      if (!valid) {
        return reply(
          '📌 Usage: send or reply with an Instagram post/reel link.\n' +
          'Example: *.instagram https://www.instagram.com/reel/xxxx/*'
        );
      }

      // reacting: loading
      await sock.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

      // 4) fetch media
      const res = await igdl(url);
      const items = res?.data || [];
      if (!items.length) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply('❌ No media found at that link.');
      }

      const caption = '༒ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ ʙʏ *ᴛʜᴇ sᴛɪᴀɴ*';

      // 5) send up to 20 medias
      for (let i = 0; i < Math.min(20, items.length); i++) {
        const media = items[i];
        const mediaUrl = media?.url;
        if (!mediaUrl) continue;

        const isVideo =
          media?.type === 'video' ||
          /\/reel\//i.test(url) ||
          /\/tv\//i.test(url) ||
          /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(mediaUrl);

        if (isVideo) {
          await sock.sendMessage(
            m.chat,
            { video: { url: mediaUrl }, mimetype: 'video/mp4', caption },
            { quoted: m }
          );
        } else {
          await sock.sendMessage(
            m.chat,
            { image: { url: mediaUrl }, caption },
            { quoted: m }
          );
        }
      }

      // done
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('instagram downloader error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ An error occurred while processing your request.');
    }
  }
};