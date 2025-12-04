const fs = require('fs');
const path = require('path');

// Settings file path
const settingsPath = path.join(process.cwd(), 'settings', 'bot-settings.json');

// Load settings from file
function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading bot settings:', error);
    }
    return {
        autoStatusReact: false,
        autoTyping: false,
        autoRecording: false,
        alwaysOnline: false
    };
}

// Save settings to file
function saveSettings(settings) {
    try {
        const settingsDir = path.dirname(settingsPath);
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir, { recursive: true });
        }
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving bot settings:', error);
    }
}

// Initialize settings on module load
const botSettings = loadSettings();

// Export function to restore settings to sock object
function restoreSettings(sock) {
    sock.autoStatusReact = botSettings.autoStatusReact || false;
    sock.autoTyping = botSettings.autoTyping || false;
    sock.autoRecording = botSettings.autoRecording || false;
    sock.alwaysOnline = botSettings.alwaysOnline || false;
    
    if (sock.autoStatusReact) {
        console.log('✅ Auto status react restored: ON');
    }
}

module.exports = {
    command: 'autostatusreact',
    description: 'Toggle automatic status reactions',
    category: 'owner',
    restoreSettings, // Export this so message.js can call it on startup
    execute: async (sock, m, params) => {
        const { args, isCreator, reply, prefix } = params;
        
        try {
            // Only owner can use this command
            if (!isCreator) {
                return await reply("```For Bot Owner Only!```");
            }

            const action = args[0]?.toLowerCase();

            // Usage information
            const usage = `❤️ *AUTO REACT TO STATUS*

*Current Status:* ${sock.autoStatusReact ? '✅ Enabled' : '❌ Disabled'}

*Usage:*
${prefix}autostatusreact on - Enable auto reactions
${prefix}autostatusreact off - Disable auto reactions

*Emojis:* ❤️ 🔥 😍 👍 ⚡

*Note:* When enabled, the bot will automatically react to all statuses with random emojis. Setting persists after restart.`;

            if (!action || !['on', 'off'].includes(action)) {
                return await reply(usage);
            }

            // Handle ON command
            if (action === 'on') {
                if (sock.autoStatusReact) {
                    return await reply('❤️ Auto react to status is already on!');
                }

                // Enable auto status react
                sock.autoStatusReact = true;
                
                // Save to file
                botSettings.autoStatusReact = true;
                saveSettings(botSettings);
                
                await sock.sendMessage(m.chat, { 
                    react: { text: "❤️", key: m.key } 
                });

                return await reply(
                    `❤️ *Auto React to Status Enabled!*\n\n` +
                    `The bot will now automatically react to all statuses.\n\n` +
                    `Emojis: ❤️ 🔥 😍 👍 ⚡\n\n` +
                    `✅ Setting saved\n\n` +
                    `> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                );
            }

            // Handle OFF command
            if (action === 'off') {
                if (!sock.autoStatusReact) {
                    return await reply('⚪ Auto react to status is already off!');
                }

                // Disable auto status react
                sock.autoStatusReact = false;
                
                // Save to file
                botSettings.autoStatusReact = false;
                saveSettings(botSettings);
                
                await sock.sendMessage(m.chat, { 
                    react: { text: "⚪", key: m.key } 
                });

                return await reply(
                    `⚪ *Auto React to Status Disabled!*\n\n` +
                    `The bot will no longer react to statuses.\n\n` +
                    `✅ Setting saved\n\n` +
                    `> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                );
            }

        } catch (error) {
            console.error('Error in autostatusreact command:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply(`❌ Error: ${error.message || 'Failed to update auto status react.'}`);
        }
    }
};