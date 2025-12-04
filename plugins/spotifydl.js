const axios = require('axios');

module.exports = {
    command: 'spotifydl',
    alias: ['song', 'play', 'sp'],
    category: 'downloader',
    description: 'Download Spotify songs (David Cyril Engine)',
    execute: async (sock, m, params) => {
        const { q, reply, prefix } = params;

        if (!q) {
            return await reply(
                '❌ *Please provide a song name!*\n\n' +
                `💡 Example: ${prefix}spotify Lucid Dreams`
            );
        }

        try {
            // 1. Stian reaction
            await sock.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

            // --- STEP A: SEARCH  ---
            // Stian Spotify Search API
            const searchUrl = `https://apis.davidcyriltech.my.id/search/spotify?text=${encodeURIComponent(q)}`;
            const { data: searchData } = await axios.get(searchUrl);

            if (!searchData || !searchData.success || searchData.result.length === 0) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                return await reply('❌ *Song not found!* Please try a different spelling.');
            }

            // Get the best result
            const track = searchData.result[0];
            
            // Prepare Metadata
            const trackInfo = `
╭━━〔 🎧 *Spotify Player* 〕━━✦
┃
┃ 🎼 *Title:* ${track.trackName}
┃ 🎤 *Artist:* ${track.artistName}
┃ 💿 *Album:* ${track.albumName}
┃ ⏱️ *Duration:* ${track.duration}
┃ 🔗 *Link:* ${track.externalUrl}
┃
╰━━━━━━━━━━━━━━━━✦

> 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉
            `.trim();

            // 2. Send Info + Thumbnail
            await sock.sendMessage(m.chat, {
                image: { url: track.thumbnail },
                caption: trackInfo
            }, { quoted: m });

            // --- Stian DOWNLOAD ---
            const downloadApi = `https://apis.davidcyriltech.my.id/spotifydl2?url=${encodeURIComponent(track.externalUrl)}`;
            const { data: dlData } = await axios.get(downloadApi);

            // Validate Response based on your screenshot
            if (!dlData || !dlData.success || !dlData.results || !dlData.results.downloadMP3) {
                return await reply('❌ *Download Error:* The API could not fetch the audio file.');
            }

            const downloadUrl = dlData.results.downloadMP3;

            // 3. Send the Audio File
            await sock.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${track.trackName}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: track.trackName,
                        body: track.artistName,
                        thumbnailUrl: track.thumbnail,
                        sourceUrl: track.externalUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // 4. Success Reaction
            await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error('Spotify command error:', error);
            await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            await reply(`❌ *API Error:* ${error.message}`);
        }
    }
};