const axios = require('axios');
const config = require('../settings/config'); // Import config to get base URL

// prevent double-processing
const processed = new Set();

module.exports = {
  command: 'play2',
  alias: ['song', 'music', 'mp3'],
  description: 'Download music using The Stian API.',
  category: 'downloader',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { args, text, q, reply, prefix } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      if (!text) {
        return reply(`🎧 *THE STIAN MUSIC*\n\n┌─❖\n│ ✦ Need a song name!\n│ ✦ Example: ${prefix}play faded alan walker\n└───────────────◉`);
      }

      // Initial reaction
      await sock.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

      let processingMsg = await sock.sendMessage(m.chat, { 
          text: `🔍 *Searching for:* "${text}"\n⏳ Please wait...` 
      }, { quoted: m });

      // =======================================================
      // 🔥 The Stian
      let baseUrl = config.api.baseurl;
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

      const apiUrl = `${baseUrl}/api/play?query=${encodeURIComponent(text)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.result) {
        await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await sock.sendMessage(m.chat, { 
            text: "❌ *Song Not Found*\n\nTry a different search term.", 
            edit: processingMsg.key 
        });
        return;
      }

      const song = data.result;

      // Update to Found
      await sock.sendMessage(m.chat, { 
          text: `✅ *Song Found!*\n\n🎵 *${song.title}*\n⏱️ ${song.duration} | 👤 ${song.artist}\n\n⬇️ The Stian sending audio...`,
          edit: processingMsg.key
      });

      // Random Font Footer
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

      // Download Audio Buffer
      // In your index.js API, the field is named "download"
      const audioUrl = song.download;
      
      if (!audioUrl) {
          await sock.sendMessage(m.chat, { text: "❌ Error: Missing download link.", edit: processingMsg.key });
          return;
      }

      const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });

      // Send Audio
      await sock.sendMessage(
        m.chat,
        { 
          audio: audioRes.data, 
          mimetype: 'audio/mpeg',
          fileName: `${song.title}.mp3`,
          contextInfo: {
              externalAdReply: {
                  title: "🎧 The Stian Music",
                  body: song.artist,
                  thumbnailUrl: song.thumbnail,
                  sourceUrl: song.url,
                  mediaType: 1,
                  renderLargerThumbnail: true
              }
          }
        },
        { quoted: m }
      );

      // Send Caption with Thumbnail separately (Optional, but looks nice)
      // await sock.sendMessage(m.chat, { image: { url: song.thumbnail }, caption: caption }, { quoted: m });

      await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error('Play Plugin Error:', err);
      await sock.sendMessage(m.chat, { react: { text: "💀", key: m.key } });
      reply("❌ An unexpected error occurred.");
    }
  }
};