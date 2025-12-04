const axios = require('axios');
const config = require('../settings/config'); // Import your config file

// prevent double-processing
const processed = new Set();

module.exports = {
  command: 'play',
  alias: ['song', 'music', 'mp3'],
  description: 'Download music using The Stian API.',
  category: 'downloader',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { args, text, q, reply } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      if (!text) {
        return reply('📌 Please provide a song name.\nExample: *.play Faded*');
      }

      await sock.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });

      // =======================================================
      // 🔥 Powered by 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍
      let baseUrl = config.api.baseurl;
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

      const apiUrl = `${baseUrl}/api/play?query=${encodeURIComponent(text)}`;
      
      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.result) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply('❌ Song not found (API Error).');
      }

      const song = data.result;

      const fonts = ['ᴛʜᴇ sᴛɪᴀɴ', '𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍', '𝑻𝑯𝑬 𝑺𝑻𝑰𝑨𝑵', '𝚃𝙷𝙴 𝚂𝑻𝙸𝙰𝙽'];
      const randomFooter = fonts[Math.floor(Math.random() * fonts.length)];

      const caption = `╭━━『 🎶 *THE STIAN MUSIC* 』
┃
┃ 📌 *Title:* ${song.title}
┃ 👤 *Artist:* ${song.artist}
┃ ⏱️ *Duration:* ${song.duration}
┃
╰━━━━━━━━━━━━━━◆
> ${randomFooter}`;

      // Send Thumbnail
      if (song.thumbnail) {
        await sock.sendMessage(m.chat, { image: { url: song.thumbnail }, caption: caption }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, { text: caption }, { quoted: m });
      }

      // Download Buffer
      const audioUrl = song.download;
      if (!audioUrl) return reply('❌ Download link missing.');

      const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });

      // Send Audio
      await sock.sendMessage(
        m.chat,
        { 
          audio: audioRes.data, 
          mimetype: 'audio/mpeg',
          fileName: `${song.title}.mp3` 
        },
        { quoted: m }
      );

      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('Play API Error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ Error fetching song.');
    }
  }
};