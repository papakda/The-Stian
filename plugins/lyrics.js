const axios = require('axios');

module.exports = {
    command: 'lyrics',
    alias: ['lirik', 'songtext'],
    category: 'tools',
    description: 'Find lyrics (Requires: Title | Artist)',
    execute: async (sock, m, params) => {
        const { q, reply, prefix } = params;

        // 1. Check for the separator "|"
        if (!q || !q.includes('|')) {
            return await reply(
                '❌ *Incorrect Format!*\n\n' +
                'You must separate the Song and Artist with a `|` symbol.\n\n' +
                `✅ *Correct:* ${prefix}lyrics Faded | Alan Walker\n` +
                `✅ *Correct:* ${prefix}lyrics Mockingbird | Eminem`
            );
        }

        try {
            await sock.sendMessage(m.chat, { react: { text: "🔎", key: m.key } });

            // 2. Split the input into Title and Artist
            const [titleRaw, artistRaw] = q.split('|');
            const title = titleRaw.trim();
            const artist = artistRaw.trim();

            // 3. Call the API (David Cyril Tech)
            const apiUrl = `https://apis.davidcyriltech.my.id/lyrics?t=${encodeURIComponent(title)}&a=${encodeURIComponent(artist)}`;
            const { data } = await axios.get(apiUrl);

            // 4. Validate Response
            if (!data.success && !data.lyrics) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                return await reply('❌ *Lyrics not found!* Check the spelling of the artist name.');
            }

            // 5. Format the Message
            const lyricsText = `
🎵 *LYRICS FINDER* 🎵
━━━━━━━━━━━━━━
🎤 *Title:* ${data.title || title}
👤 *Artist:* ${data.artist || artist}
━━━━━━━━━━━━━━

${data.lyrics}

> 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉
            `.trim();

            // 6. Send Image + Lyrics
            if (data.thumbnail) {
                await sock.sendMessage(m.chat, {
                    image: { url: data.thumbnail },
                    caption: lyricsText
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: lyricsText
                }, { quoted: m });
            }

            await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error('Lyrics command error:', error);
            await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            await reply(`❌ *API Error:* ${error.message}`);
        }
    }
};