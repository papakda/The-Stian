const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    command: 'system',
    alias: ['settings', 'status', 'info'],
    description: 'Display all bot system settings and status',
    category: 'general',
    owner: true,
    execute: async (sock, m, params) => {
        const { reply } = params;
        
        try {
            // Get prefix
            const { getPrefix } = require('../lib/prefix');
            const prefix = getPrefix();

            // Load bot-settings.json
            const botSettingsPath = path.join(process.cwd(), 'settings', 'bot-settings.json');
            let botSettings = {
                public: true,
                autoStatusReact: false,
                autoTyping: false,
                autoRecording: false,
                alwaysOnline: false,
                botStatus: true
            };

            if (fs.existsSync(botSettingsPath)) {
                try {
                    botSettings = JSON.parse(fs.readFileSync(botSettingsPath, 'utf8'));
                } catch (error) {
                    console.log('Error reading bot-settings.json:', error.message);
                }
            }

            // Load autoview_status.json
            const autoViewPath = path.join(process.cwd(), 'data', 'autoview_status.json');
            let autoViewStatus = { enabled: false };

            if (fs.existsSync(autoViewPath)) {
                try {
                    autoViewStatus = JSON.parse(fs.readFileSync(autoViewPath, 'utf8'));
                } catch (error) {
                    console.log('Error reading autoview_status.json:', error.message);
                }
            }

            // Load config
            const config = require('../settings/config');

            // Get system info
            const usedMem = process.memoryUsage().heapUsed / 1024 / 1024;
            const totalMem = os.totalmem() / 1024 / 1024 / 1024;
            const uptimeSec = process.uptime();
            const days = Math.floor(uptimeSec / (3600 * 24));
            const hours = Math.floor((uptimeSec % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptimeSec % 3600) / 60);
            const seconds = Math.floor(uptimeSec % 60);
            const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            const platform = os.platform();
            const nodeVersion = process.version;

            // Format on/off status
            const formatStatus = (status) => status ? '🟢 ON' : '🔴 OFF';
            const formatMode = (isPublic) => isPublic ? '🌍 Public' : '🔒 Private';

            // Build system status message
            const systemMessage = `╭══✦〔 📊 *SYSTEM STATUS* 〕✦══╮
┃
┃ ➤ 🤖 *BOT SETTINGS*
┃
┃ ▸ *Bot Status:* ${formatStatus(botSettings.botStatus !== false)}
┃ ▸ *Mode:* ${formatMode(botSettings.public !== false)}
┃ ▸ *Prefix:* ${prefix}
┃ ▸ *Bot Name:* ${config.settings?.title || 'THE STIAN'}
┃ ▸ *Owner:* ${config.settings?.owner || 'The Stian'}
┃
┃ ➤ ⚙️ *FEATURES*
┃
┃ ▸ *Auto Status View:* ${formatStatus(autoViewStatus.enabled)}
┃ ▸ *Auto Status React:* ${formatStatus(botSettings.autoStatusReact)}
┃ ▸ *Auto Typing:* ${formatStatus(botSettings.autoTyping)}
┃ ▸ *Auto Recording:* ${formatStatus(botSettings.autoRecording)}
┃ ▸ *Always Online:* ${formatStatus(botSettings.alwaysOnline)}
┃
┃ ➤ 💻 *SYSTEM INFO*
┃
┃ ▸ *Platform:* ${platform}
┃ ▸ *Node Version:* ${nodeVersion}
┃ ▸ *RAM Usage:* ${usedMem.toFixed(2)} MB / ${totalMem.toFixed(2)} GB
┃ ▸ *Uptime:* ${uptime}
┃
┃ ➤ 📂 *FILE PATHS*
┃
┃ ▸ *Bot Settings:* ${fs.existsSync(botSettingsPath) ? '✅ Found' : '❌ Missing'}
┃ ▸ *Auto View:* ${fs.existsSync(autoViewPath) ? '✅ Found' : '❌ Missing'}
┃ ▸ *Config:* ✅ Loaded
╰══───────────────❍

> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍

_Use commands to change settings:_
• \`${prefix}mode\` - Change bot mode
• \`${prefix}stian\` - Toggle bot on/off
• Feature commands in their respective categories`;

            await reply(systemMessage);

        } catch (error) {
            console.error('Error in system command:', error);
            await reply('❌ An error occurred while fetching system settings.\n\n' + error.message);
        }
    }
};