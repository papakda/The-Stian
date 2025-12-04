const isAdmin = require('../lib/isAdmin');
const { getAntilink, setAntilink, removeAntilink } = require('../library/index');

module.exports = {
    command: 'antilink1',
    description: 'Manage antilink protection for the group',
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
            // Check if user is admin using external helper
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) {
                return await reply("```For Group Admins Only!```");
            }

            // Check if bot is admin
            if (!adminCheck.isBotAdmin) {
                return await reply("❌ I need to be an admin to manage antilink protection!");
            }

            const cmdArgs = q ? q.toLowerCase().trim().split(' ') : [];
            const action = cmdArgs[0];
            const status = cmdArgs[1];

            const usage = `\`\`\`ANTILINK SETUP

Usage:
${prefix}antilink
(to see current status)
${prefix}antilink [kick|delete|warn] on
${prefix}antilink [kick|delete|warn] off
\`\`\``;

            // Show current status if no arguments
            if (!action) {
                const currentConfig = await getAntilink(m.chat, 'on');
                const currentStatus = currentConfig && currentConfig.enabled ? 'ON' : 'OFF';
                const currentAction = currentConfig && currentConfig.action ? currentConfig.action : 'delete (default)';

                return await reply(
                    `*_Antilink Configuration:_*` +
                    `\nStatus: *${currentStatus}*` +
                    `\nAction: *${currentAction}*\n\n` +
                    usage
                );
            }

            const validActions = ['kick', 'delete', 'warn'];
            if (!validActions.includes(action)) {
                return await reply(`*_Invalid action. Please use kick, delete, or warn._*`);
            }

            if (status === 'on') {
                const result = await setAntilink(m.chat, 'on', action);
                if (result) {
                    await sock.sendMessage(m.chat, { 
                        react: { text: "✅", key: m.key } 
                    });
                    await reply(`*_Antilink has been turned ON with action set to ${action}_*`);
                } else {
                    await reply('*_Failed to turn on Antilink_*');
                }
            } else if (status === 'off') {
                await removeAntilink(m.chat, 'on');
                await sock.sendMessage(m.chat, { 
                    react: { text: "🔓", key: m.key } 
                });
                await reply('*_Antilink has been turned OFF_*');
            } else {
                await reply(usage);
            }

        } catch (error) {
            console.error('Error in antilink command:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply(`❌ Error: ${error.message || 'Failed to update antilink settings.'}`);
        }
    }
};