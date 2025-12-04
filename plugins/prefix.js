const { getPrefix, setPrefix } = require('../lib/prefix');
const isOwner = require('../lib/isOwner');

module.exports = {
    command: 'setprefix',
    alias: ['prefix', 'changeprefix'],
    description: "Change the bot's command prefix",
    category: 'owner',
    execute: async (sock, m, params) => {
        const { args, reply, prefix, sender } = params;

        // Check if user is owner
       const userIsOwner = await isOwner(sender);

        if (!userIsOwner) {
            return await reply("*📛 Only the owner can use this command!*");
        }

        const newPrefix = args[0];

        // Show current prefix if no argument
        if (!newPrefix) {
            const currentPrefix = getPrefix();
            return await reply(
                `🔧 *Current Prefix:* \`${currentPrefix}\`\n\n` +
                `*Usage:* ${prefix}setprefix <new_prefix>\n\n` +
                `*Examples:*\n` +
                `• ${prefix}setprefix !\n` +
                `• ${prefix}setprefix #\n` +
                `• ${prefix}setprefix /\n\n` +
                `💡 The prefix will be saved and work after restart.`
            );
        }

        // Validate prefix (optional - remove if you want to allow any character)
        if (newPrefix.length > 3) {
            return await reply("❌ Prefix should be 1-3 characters only!");
        }

        // Send processing reaction
        await sock.sendMessage(m.chat, { 
            react: { text: "🔧", key: m.key } 
        });

        // Set the new prefix
        const success = setPrefix(newPrefix);

        if (success) {
            await sock.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

            return await reply(
                `✅ *Prefix Updated Successfully!*\n\n` +
                `*Old Prefix:* \`${prefix}\`\n` +
                `*New Prefix:* \`${newPrefix}\`\n\n` +
                `🔄 No restart needed!\n` +
                `💾 Saved permanently\n\n` +
                `*Example:* ${newPrefix}menu\n\n` +
                `> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
            );
        } else {
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            
            return await reply("❌ *Failed to update prefix!* Please try again.");
        }
    }
};