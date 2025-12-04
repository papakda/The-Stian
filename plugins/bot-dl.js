const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'stian',
    description: 'Toggle bot online/offline status',
    category: 'owner',
    execute: async (sock, m, params) => {
        const { args, isCreator, reply, prefix } = params;
        
        try {
            // Only owner can use this command
            if (!isCreator) {
                return await reply("```For Bot Owner Only!```");
            }

            const action = args[0]?.toLowerCase();

            // Get current status
            const settingsPath = path.join(process.cwd(), 'settings', 'bot-settings.json');
            let currentStatus = true; // Default online
            
            try {
                if (fs.existsSync(settingsPath)) {
                    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                    currentStatus = settings.botStatus !== false;
                }
            } catch (error) {
                console.error('Error reading bot status:', error);
            }

            // Usage information
            const usage = `🤖 *BOT STATUS CONTROL*

*Current Status:* ${currentStatus ? '✅ ONLINE' : '❌ OFFLINE'}

*Usage:*
${prefix}stian on - Activate bot
${prefix}stian off - Deactivate bot

*Note:* When offline, bot won't respond to any commands except \`${prefix}stian on\` from owner.`;

            if (!action || !['on', 'off'].includes(action)) {
                return await reply(usage);
            }

            // Handle ON command
            if (action === 'on') {
                if (currentStatus) {
                    return await reply('✅ Bot is already online!');
                }

                // Turn bot ON
                try {
                    let settings = { 
                        autoStatusReact: false, 
                        autoTyping: false, 
                        autoRecording: false, 
                        alwaysOnline: false,
                        botStatus: true 
                    };
                    
                    if (fs.existsSync(settingsPath)) {
                        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                    }
                    
                    settings.botStatus = true;
                    
                    const settingsDir = path.dirname(settingsPath);
                    if (!fs.existsSync(settingsDir)) {
                        fs.mkdirSync(settingsDir, { recursive: true });
                    }
                    
                    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
                } catch (err) {
                    console.error('Error saving settings:', err);
                }

                await sock.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });

                return await reply(
                    `✅ *BOT ACTIVATED!*\n\n` +
                    `Status: *ONLINE*\n` +
                    `Bot is now responding to all commands.\n\n` +
                    `💚 Welcome back!\n\n` +
                    `> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                );
            }

            // Handle OFF command
            if (action === 'off') {
                if (!currentStatus) {
                    return await reply('❌ Bot is already offline!');
                }

                // Turn bot OFF
                try {
                    let settings = { 
                        autoStatusReact: false, 
                        autoTyping: false, 
                        autoRecording: false, 
                        alwaysOnline: false,
                        botStatus: true 
                    };
                    
                    if (fs.existsSync(settingsPath)) {
                        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                    }
                    
                    settings.botStatus = false;
                    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
                } catch (err) {
                    console.error('Error saving settings:', err);
                }

                await sock.sendMessage(m.chat, { 
                    react: { text: "🔴", key: m.key } 
                });

                return await reply(
                    `🔴 *BOT DEACTIVATED!*\n\n` +
                    `Status: *OFFLINE*\n` +
                    `Bot will not respond to any commands.\n\n` +
                    `To reactivate: \`${prefix}stian on\`\n\n` +
                    `💤 Going to sleep...\n\n` +
                    `> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                );
            }

        } catch (error) {
            console.error('Error in bot command:', error);
            await reply('❌ Error toggling bot status. Please try again.');
        }
    }
};