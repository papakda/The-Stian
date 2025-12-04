const { ytsearch } = require('@dark-yasiya/yt-dl.js');

module.exports = {
    command: 'song',
    description: 'Download YouTube audio (MP3) from a URL or search query',
    category: 'downloader',
    execute: async (sock, m, {
        args,
        text,
        q,
        quoted,
        mime,
        qmsg,
        isMedia,
        groupMetadata,
        groupName,
        participants,
        groupOwner,
        groupAdmins,
        isBotAdmins,
        isAdmins,
        isGroupOwner,
        isCreator,
        prefix,
        reply,
        config,
        sender
    }) => {
        try {
            if (!text) {
                return await reply("❌ Please provide a YouTube URL or song name!\nExample: `.song faded by alan walker`");
            }

            // Add initial reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "🔍", key: m.key } 
            });

            // Check if input is a YouTube URL or search query
            let targetUrl = text;
            const isYT = /(youtube\.com|youtu\.be)/i.test(text);
            let searched = null;

            if (!isYT) {
                // Search YouTube if not a URL
                const searchResult = await ytsearch(text);
                if (!searchResult?.results?.length) {
                    await sock.sendMessage(m.chat, { 
                        react: { text: "❌", key: m.key } 
                    });
                    return await reply("❌ No results found for your query!");
                }
                searched = searchResult.results[0];
                targetUrl = searched.url;
            }

            // Update reaction to downloading
            await sock.sendMessage(m.chat, { 
                react: { text: "⏳", key: m.key } 
            });

            // Call download API
            const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(targetUrl)}`;
            const response = await fetch(apiUrl);
            const data = await response.json().catch(() => ({}));

            if (!data?.status || !data?.audio) {
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return await reply("🚫 Failed to fetch audio details. Please try again later.");
            }

            const audio = data;
            
            // Function to clean filename
            const cleanFilename = (str) => String(str || '').replace(/[\/\\?%*:|"<>]/g, '_');

            const title = audio.title || searched?.title || 'YouTube Audio';
            const thumbnail = audio.thumbnail || searched?.image || searched?.thumbnail || '';

            const caption = `🎶 𝐘𝐓 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 🔥

╭───────◆◆►
┃◈ 𝐓𝐢𝐭𝐥𝐞: ${title}
┃◈ 𝐅𝐨𝐫𝐦𝐚𝐭: mp3
┃◈ 𝐓𝐢𝐦𝐞: ${searched?.timestamp || 'N/A'}
┃◈ 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${searched?.ago || 'N/A'}
┃◈ 𝐕𝐢𝐞𝐰𝐬: ${searched?.views || 'N/A'}
┃◈ 𝐋𝐢𝐤𝐞𝐬: N/A
╰───────◆◆►

> *𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉*`;

            // Send preview card with thumbnail
            if (thumbnail) {
                await sock.sendMessage(m.chat, {
                    image: { url: thumbnail },
                    caption: caption
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: caption
                }, { quoted: m });
            }

            // Send MP3 as document
            await sock.sendMessage(m.chat, {
                document: { url: data.audio },
                mimetype: 'audio/mpeg',
                fileName: `${cleanFilename(title)}.mp3`,
                caption: `𝚃𝙷𝙴 𝚂𝚃𝙸𝙰𝙽`
            }, { quoted: m });

            // Success reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error('Error in song command:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply(`🔴 Error: ${error.message || 'Download failed. Please try again later.'}`);
        }
    }
};