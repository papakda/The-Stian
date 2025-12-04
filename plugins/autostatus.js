const fs = require('fs');
const path = require('path');

// 1. Define where to save the settings
// We will save it in the root folder under 'database'
const dbPath = path.join(__dirname, '../database');
const configPath = path.join(dbPath, 'autoStatus.json');

// Ensure database folder exists
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

module.exports = {
    command: 'autostatus',
    alias: ['autosview', 'asv'],
    description: 'Enable or Disable Auto Status View',
    category: 'owner',
    execute: async (sock, m, params) => {
        const { args, reply, isCreator } = params;

        // 2. Security Check (Owner Only)
        // Assuming your 'params' includes isCreator/isOwner. 
        // If not, import your isOwner lib like we did for restart.
        if (!isCreator) {
             await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
             return reply("❌ *Access Denied:* Only the Owner can use this.");
        }

        // 3. Load Current Config (or create default)
        let config = { enabled: false, react: false };
        if (fs.existsSync(configPath)) {
            try {
                config = JSON.parse(fs.readFileSync(configPath));
            } catch { /* use default */ }
        }

        // 4. Handle Input
        const option = args[0] ? args[0].toLowerCase() : '';
        const subOption = args[1] ? args[1].toLowerCase() : '';

        if (option === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return reply("✅ *Auto Status View has been ENABLED!*");
        } 
        
        else if (option === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            return reply("❌ *Auto Status View has been DISABLED!*");
        }

        else if (option === 'react') {
            if (subOption === 'on') {
                config.react = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                return reply("💫 *Auto-Reaction has been ENABLED!*");
            } else if (subOption === 'off') {
                config.react = false;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                return reply("❌ *Auto-Reaction has been DISABLED!*");
            } else {
                return reply("⚠️ *Use:* `.autostatus react on` or `.autostatus react off`");
            }
        }

        else {
            // Status Menu
            const statusTxt = config.enabled ? "✅ ON" : "❌ OFF";
            const reactTxt = config.react ? "✅ ON" : "❌ OFF";
            
            return reply(
                `🔄 *AUTO STATUS SETTINGS*\n\n` +
                `👀 *View Status:* ${statusTxt}\n` +
                `💫 *React Status:* ${reactTxt}\n\n` +
                `*Commands:*\n` +
                `• ${params.prefix}autostatus on\n` +
                `• ${params.prefix}autostatus off\n` +
                `• ${params.prefix}autostatus react on\n` +
                `• ${params.prefix}autostatus react off`
            );
        }
    }
};