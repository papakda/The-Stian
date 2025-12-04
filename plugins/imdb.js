const axios = require('axios');

// prevent double-processing
const processed = new Set();

module.exports = {
  command: 'imdb',
  alias: ['movie', 'film', 'series'],
  description: 'Search for movie details using David Cyril API with stylish formatting.',
  category: 'search',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { text, reply } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      // 1) Validate Input
      if (!text) {
        return reply('📌 Please provide a movie name.\nExample: *.imdb Iron Man*');
      }

      // React loading
      await sock.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

      const { data } = await axios.get(`https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(text)}`);

      // 3) Validate API Response
      if (!data || !data.status || !data.movie) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply('❌ Movie not found or API error.');
      }

      const movie = data.movie;

      // 4) Construct the "Interactive" Caption
      const caption = `╭━━『 🎬 *IMDB SEARCH* 』
┃
┃ 🎞️ *Title:* ${movie.title}
┃ 📅 *Year:* ${movie.year}
┃ 🔞 *Rated:* ${movie.rated}
┃ 📆 *Released:* ${movie.released}
┃ ⏱️ *Runtime:* ${movie.runtime}
┃ 🎭 *Genre:* ${movie.genres}
┃ 🎬 *Director:* ${movie.director}
┃ ✍️ *Writer:* ${movie.writer}
┃ 👥 *Actors:* ${movie.actors}
┃
┃ 📝 *Plot:*
┃ ${movie.plot}
┃
╰━━━━━━━━━━━━━━◆

_*Requested by ${m.pushName || 'User'}*_`;

      // 5) Send Message
      // Most IMDB APIs include a 'poster' url. If not, we just send text.
      if (movie.poster && movie.poster !== 'N/A') {
        await sock.sendMessage(
          m.chat,
          { 
            image: { url: movie.poster }, 
            caption: caption 
          },
          { quoted: m }
        );
      } else {
        // Fallback text only
        await sock.sendMessage(
          m.chat,
          { text: caption },
          { quoted: m }
        );
      }

      // Done
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('IMDB Plugin Error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ An error occurred while fetching movie data.');
    }
  }
};