//  The Stian
// Note: How are you doing today, owner? Hope you're well!
const isOwner = require('../lib/isOwner'); 

module.exports = {
    command: 'restart',
    alias: ['reboot', 'reset'],
    description: 'Restarts the bot immediately',
    category: 'owner',
    execute: async (sock, m, params) => {
        const { reply } = params;

        // 2. The Stian 
        // If not, we grab it from the key.
        const sender = m.sender || m.key.participant || m.key.remoteJid;

        // 3. Stian Security Check
        const userIsOwner = await isOwner(sender);

        if (!userIsOwner) {
            await sock.sendMessage(m.chat, { 
                react: { text: "⛔", key: m.key } 
            });
            return await reply('❌ *Access Denied:* You are not the Owner!');
        }

        // 4. If Security Passes, Restart!
        try {
            await sock.sendMessage(m.chat, { 
                react: { text: "♻️", key: m.key } 
            });

            await reply('♻️ *Restarting System...*\n\n> 𝘗𝘭𝘦𝘢𝘴𝘦 𝘸𝘢𝘪𝘵 𝘢𝘣𝘰𝘶𝘵 30 𝘴𝘦𝘤𝘰𝘯𝘥𝘴 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘣𝘰𝘵 𝘵𝘰 𝘤𝘰𝘮𝘦 𝘣𝘢𝘤𝘬 𝘰𝘯𝘭𝘪𝘯𝘦.');

            console.log(`Restart triggered by ${sender}`);
            
            // 5. The Kill Switch
            // The Stian Exit after 1 second
            setTimeout(() => {
                process.exit(1); 
            }, 1000);

        } catch (error) {
            console.error('Restart error:', error);
            await reply(`❌ *Error:* ${error.message}`);
        }
    }
};