// plugins/live.js - Bot status and system info
const os = require('os');
const { runtime } = require('../lib/functions');

module.exports = {
    command: 'live',
    description: 'Shows system and bot live status',
    category: 'general',
    execute: async (sock, m, params) => {
        const { reply, config, sender } = params;

        try {
            const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
            const uptime = runtime(process.uptime());
            const platform = os.platform();
            const cpu = os.cpus()[0]?.model || 'Unknown CPU';
            const mode = sock.public ? 'Public' : 'Self';
            const version = '4.0.8'; // Your bot version

            const caption = `
╭─❖『 *SYSTEM CORE STATUS* 』
│
│ ⚙️ *Bot Name:* ${config.settings.title}
│ 👤 *Owner:* Stian
│ 💾 *RAM:* ${usedRam}MB / ${totalRam}MB
│ 🧠 *CPU:* ${cpu.split(" ")[0]} (${platform})
│ ⏱️ *Uptime:* ${uptime}
│ 🧩 *Mode:* ${mode}
│ 💬 *Prefix:* [ . ]
│ 🧷 *Version:* ${version}
│ 🌐 *Network Node:* ${os.hostname()}
│
╰─────────────────
🩶 System Stable | Core Functional
            `.trim();

            await sock.sendMessage(m.chat, {
                image: { url: config.thumbUrl || 'https://files.catbox.moe/y2o0lz.jpg' },
                caption,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 888,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422654613125@newsletter',
                        newsletterName: '『 ᴛʜᴇ sᴛɪᴀɴ 』',
                        serverMessageId: 200
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error("Live Command Error:", error);
            await reply(`❌ Error: ${error.message}`);
        }
    }
};