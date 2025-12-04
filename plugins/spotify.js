const axios = require("axios");
const yts = require('yt-search');

module.exports = {
    command: "spotify",
    alias: ["spplay", "spotifyplay", "splay"],
    description: "Play songs directly from Spotify (via YouTube)",
    category: "downloader",
    execute: async (sock, m, params) => {
        const { args, q, prefix, reply } = params;

        const text = q || (m.quoted && m.quoted.text) || null;

        if (!text) {
            return await reply(
                "❌ *Please enter a song name!*\n\n" +
                `💡 Example: ${prefix}spotify Someone Like You`
            );
        }

        try {
            // Stian reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "🎵", key: m.key } 
            });

            await reply("🔎 *Searching for your song...* 🎶");

            // Search YouTube If Spotify API is not directly accessible
            const { videos } = await yts(text);
            
            if (!videos || videos.length === 0) {
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return await reply("❌ *Couldn't find that song!* Try another name.");
            }

            const video = videos[0];

            // Update reaction to downloading
            await sock.sendMessage(m.chat, { 
                react: { text: "⬇️", key: m.key } 
            });

            const caption = `
╭━━〔 🎧 *Spotify Player* 〕━━✦
┃ 🎵 *Title:* ${video.title}
┃ 👤 *Artist:* ${video.author.name}
┃ ⏱ *Duration:* ${video.timestamp}
┃ 👁 *Plays:* ${video.views.toLocaleString()}
┃ 📅 *Released:* ${video.ago}
┃
┃ ⚙️ *Powered by:* THE STIAN
╰━━━━━━━━━━━━━━━━✦

⏳ *Downloading from Spotify...*

> 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉
`.trim();

            // Send image card with track info
            await sock.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: caption
            }, { quoted: m });

            // Download audio from YouTube
            const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(video.url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data?.status || !data.audio) {
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return await reply("❌ *Download failed!* Please try again later.");
            }

            // Success reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

            // Send audio file
            await sock.sendMessage(
                m.chat,
                {
                    audio: { url: data.audio },
                    mimetype: "audio/mpeg",
                    fileName: `${data.title || video.title}.mp3`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Spotify Command Error:", err);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            
            await reply(`❌ *Error:* ${err.message || 'Something went wrong! Please try again.'}`);
        }
    }
};