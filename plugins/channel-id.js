// plugins/newsletter.js - Get WhatsApp Channel info from link

module.exports = {
    command: 'newsletter',
    description: 'Get WhatsApp Channel info from link',
    category: 'tools',
    execute: async (sock, m, params) => {
        const { q, prefix, reply } = params;

        try {
            if (!q) {
                return await reply(
                    `❎ *Please provide a WhatsApp Channel link.*\n\n` +
                    `📌 *Example:*\n${prefix}newsletter https://whatsapp.com/channel/xxxxxxxxxx`
                );
            }

            const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
            if (!match) {
                return await reply(
                    `⚠️ *Invalid channel link!*\n\n` +
                    `Make sure it looks like:\n` +
                    `https://whatsapp.com/channel/xxxxxxxxx`
                );
            }

            const inviteId = match[1];
            let metadata;

            try {
                metadata = await sock.newsletterMetadata("invite", inviteId);
            } catch (error) {
                console.error('Newsletter metadata error:', error);
                return await reply(
                    "🚫 *Failed to fetch channel info.*\n" +
                    "Double-check the link and try again."
                );
            }

            if (!metadata?.id) {
                return await reply("❌ *Channel not found or inaccessible.*");
            }

            const infoText = `
╭─❍『 📡 ᴄʜᴀɴɴᴇʟ ɪɴꜰᴏ 』❍─
│
│ 🔖 *ID:* ${metadata.id}
│ 🗂️ *Name:* ${metadata.name}
│ 👥 *Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}
│ 🗓️ *Created:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("en-KE", { timeZone: 'Africa/Nairobi' }) : "Unknown"}
│
╰─⭓ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *ᴛʜᴇ sᴛɪᴀɴ*
            `.trim();

            if (metadata.preview) {
                await sock.sendMessage(m.chat, {
                    image: { url: `https://pps.whatsapp.net${metadata.preview}` },
                    caption: infoText
                }, { quoted: m });
            } else {
                await reply(infoText);
            }

        } catch (err) {
            console.error("❌ Newsletter Error:", err);
            await reply("⚠️ *An unexpected error occurred while fetching the channel info.*");
        }
    }
};