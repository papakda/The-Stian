const os = require('os');

// Helper function to make seconds readable (e.g., "2 hours, 5 minutes")
function formatUptime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " d, " : " d, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " h, " : " h, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " m, " : " m, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

// Helper to format bytes (RAM)
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports = {
    command: 'uptime',
    alias: ['runtime', 'alive', 'ping'],
    description: 'Check how long the bot has been online',
    category: 'general',
    execute: async (sock, m, params) => {
        const { reply } = params;

        try {
            // 1. Send Reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "⏱️", key: m.key } 
            });

            // 2. Calculate Data
            const uptime = process.uptime();
            const uptimeText = formatUptime(uptime);
            
            // Get RAM Usage (Useful for checking Render limits!)
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;

            // 3. Construct Message
            const status = `
🤖 *SYSTEM STATUS*
━━━━━━━━━━━━━━
⏳ *Uptime:* ${uptimeText}
💻 *RAM:* ${formatBytes(usedMem)} / ${formatBytes(totalMem)}
🖥️ *Platform:* ${os.platform()}
🚀 *Host:* ${os.hostname()}
━━━━━━━━━━━━━━
> 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉
            `.trim();

            // 4. Send Message
            await sock.sendMessage(m.chat, {
                text: status
            }, { quoted: m });

        } catch (error) {
            console.error('Uptime command error:', error);
            await reply(`❌ *Error:* ${error.message}`);
        }
    }
};