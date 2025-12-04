// plugins/block.js - Block and Unblock commands

module.exports = [
    // BLOCK COMMAND
    {
        command: 'block',
        description: 'Block a user',
        category: 'owner',
        execute: async (sock, m, params) => {
            const { isCreator, q, reply } = params;
            
            if (!isCreator) {
                return await reply("❌ Only the bot owner can use this command.");
            }

            let jid;
            
            // Check if replying to a message
            if (m.quoted) {
                jid = m.quoted.sender;
            } 
            // Check if mentioning a user
            else if (m.mentionedJid && m.mentionedJid.length > 0) {
                jid = m.mentionedJid[0];
            } 
            // Check if typing a number
            else if (q && q.replace(/\s/g, '').length > 0) {
                // Remove @ symbol and spaces, add @s.whatsapp.net
                jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
            } 
            else {
                return await reply("❌ Please mention a user, reply to their message, or provide a number.\n\nExample:\n.block @user\n.block 2547056xxxxx");
            }

            try {
                await sock.updateBlockStatus(jid, "block");
                await reply(`✅ Successfully blocked @${jid.split("@")[0]}`, {
                    mentions: [jid]
                });
                console.log(`Blocked user: ${jid}`);
            } catch (error) {
                console.error("Block command error:", error);
                await reply("❌ Failed to block the user. Please try again.");
            }
        }
    },

    // UNBLOCK COMMAND
    {
        command: 'unblock',
        description: 'Unblock a user',
        category: 'owner',
        execute: async (sock, m, params) => {
            const { isCreator, q, reply } = params;

            if (!isCreator) {
                return await reply("❌ Only the bot owner can use this command.");
            }

            let jid;
            
            // Check if replying to a message
            if (m.quoted) {
                jid = m.quoted.sender;
            } 
            // Check if mentioning a user
            else if (m.mentionedJid && m.mentionedJid.length > 0) {
                jid = m.mentionedJid[0];
            } 
            // Check if typing a number
            else if (q && q.replace(/\s/g, '').length > 0) {
                jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
            } 
            else {
                return await reply("❌ Please mention a user, reply to their message, or provide a number.\n\nExample:\n.unblock @user\n.unblock 2547056xxxxx");
            }

            try {
                await sock.updateBlockStatus(jid, "unblock");
                await reply(`✅ Successfully unblocked @${jid.split("@")[0]}`, {
                    mentions: [jid]
                });
                console.log(`Unblocked user: ${jid}`);
            } catch (error) {
                console.error("Unblock command error:", error);
                await reply("❌ Failed to unblock the user. Please try again.");
            }
        }
    }
];