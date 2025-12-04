// plugins/youtube.js - YouTube downloaders
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

module.exports = [
    
    // MP4 VIDEO DOWNLOAD
    {
        command: 'ytmp4',
        description: 'Download YouTube video',
        category: 'downloader',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;

            try {
                if (!q) return await reply(`❌ Please provide a YouTube URL or video name.\nExample: ${prefix}ytmp4 Funny cats`);

                await reply("🔍 Searching...");

                const yt = await ytsearch(q);
                if (yt.results.length < 1) return await reply("❌ No results found!");

                let yts = yt.results[0];
                let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;

                let response = await fetch(apiUrl);
                let data = await response.json();

                if (data.status !== 200 || !data.success || !data.result.download_url) {
                    return await reply("❌ Failed to fetch video. Try again later.");
                }

                let ytmsg = `╔═══「 *𝐓𝐇𝐄-𝐒𝐓𝐈𝐀𝐍* 」═══╗\n` +
                    `║╭─────────────◆\n` +
                    `║│ *🎥 VIDEO DOWNLOADER*\n` +
                    `║╰─────────────◆\n` +
                    `╚════════════════╝\n\n` +
                    `╔════════════════╗\n` +
                    `║ ➻ *Title:* ${yts.title}\n` +
                    `║ ➻ *Duration:* ${yts.timestamp}\n` +
                    `║ ➻ *Views:* ${yts.views}\n` +
                    `║ ➻ *Author:* ${yts.author.name}\n` +
                    `║ ➻ *Link:* ${yts.url}\n` +
                    `╚════════════════╝\n\n` +
                    `> *𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉 🎬*`;

                // Send thumbnail with info
                await sock.sendMessage(m.chat, {
                    image: { url: data.result.thumbnail || yts.thumbnail },
                    caption: ytmsg
                }, { quoted: m });

                await reply("⬇️ Downloading video...");

                // Send video file
                await sock.sendMessage(m.chat, {
                    video: { url: data.result.download_url },
                    mimetype: "video/mp4",
                    caption: `✅ *${yts.title}*`
                }, { quoted: m });

                // Send as document
                await sock.sendMessage(m.chat, {
                    document: { url: data.result.download_url },
                    mimetype: "video/mp4",
                    fileName: `${data.result.title}.mp4`,
                    caption: `✅ *${yts.title}*\n\n> © *𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉 🎬*`
                }, { quoted: m });

            } catch (err) {
                console.error("YT MP4 Error:", err);
                await reply("⚠️ An error occurred while downloading.");
            }
        }
    },
    
];