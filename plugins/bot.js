module.exports = {
    command: 'bot',
    alias: ['activate'],
    category: 'general',
    description: 'Turn the bot status on or off',
    execute: async (sock, m, params) => {
        const { args, reply, prefix } = params;
        const subCommand = args[0] ? args[0].toLowerCase() : '';

        if (subCommand === 'on') {
            // 1. Send the "Check" reaction
            await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            
            // 2. Send your specific activation message
            // I made it look bold and professional
            return await reply('🤖 *𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍 successfully activated* ✅\n\n *NB:* _Use .stian command to fully activate/deactivate the bot._');
        } 
        
        else if (subCommand === 'off') {
            // 1. Send "Sleep" reaction
            await sock.sendMessage(m.chat, { react: { text: "💤", key: m.key } });
            
            return await reply('😴 *𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍 successfully deactivated*\n\n *NB:* _Use .stian command to fully activate/deactivate the bot._');
        } 
        
        else {
            // Default message if they just type ".bot"
            return await reply(`❓ *Usage:*\n\n• ${prefix}bot on\n• ${prefix}bot off`);
        }
    }
};