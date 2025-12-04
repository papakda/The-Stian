const isAdmin = require('../lib/isAdmin');

module.exports = {
    command: 'poll',
    description: 'Create a poll in the group',
    category: 'group',
    group: true,
    execute: async (sock, m, {
        args,
        text,
        q,
        quoted,
        mime,
        qmsg,
        isMedia,
        groupMetadata,
        groupName,
        participants,
        groupOwner,
        groupAdmins,
        isBotAdmins,
        isAdmins,
        isGroupOwner,
        isCreator,
        prefix,
        reply,
        config,
        sender
    }) => {
        try {
            // Check if user is admin
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) {
                return await reply("```For Group Admins Only!```");
            }

            // Usage information
            const usage = `📊 *POLL CREATOR*

*Usage:*
${prefix}poll question | option1 | option2 | option3...

*Example:*
${prefix}poll What's your favorite color? | Red | Blue | Green | Yellow

*Notes:*
• Separate question and options with |
• Minimum 2 options required
• Maximum 12 options allowed`;

            if (!text || !text.includes('|')) {
                return await reply(usage);
            }

            // Parse the poll data
            const parts = text.split('|').map(part => part.trim());
            const pollName = parts[0];
            const pollOptions = parts.slice(1);

            // Validation
            if (!pollName) {
                return await reply('❌ Please provide a poll question!');
            }

            if (pollOptions.length < 2) {
                return await reply('❌ Please provide at least 2 options!');
            }

            if (pollOptions.length > 12) {
                return await reply('❌ Maximum 12 options allowed!');
            }

            // Check for empty options
            const emptyOptions = pollOptions.filter(opt => !opt || opt === '');
            if (emptyOptions.length > 0) {
                return await reply('❌ All options must have text!');
            }

            // Send reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "📊", key: m.key } 
            });

            // Create and send the poll
            await sock.sendMessage(m.chat, {
                poll: {
                    name: pollName,
                    values: pollOptions,
                    selectableCount: 1 // Users can select only one option
                }
            }, { quoted: m });

            // Success message
            await sock.sendMessage(m.chat, {
                text: `✅ *Poll Created Successfully!*\n\n📊 Question: ${pollName}\n🔢 Options: ${pollOptions.length}\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`,
                mentions: [sender]
            }, { quoted: m });

        } catch (error) {
            console.error('Error in poll command:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply(`❌ Error: ${error.message || 'Failed to create poll.'}`);
        }
    }
};