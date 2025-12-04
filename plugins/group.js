// plugins/group.js - All group commands in one file
const isAdmin = require('../lib/isAdmin');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');

module.exports = [
    // PROMOTE
    {
        command: 'promote',
        description: 'Promote member to admin',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, groupAdmins, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            let users = m.quoted?.sender || m.mentionedJid?.[0];
            if (!users) return await reply("❌ Mention user");
            if (groupAdmins.includes(users)) return await reply("⚠️ Already admin");
            await sock.groupParticipantsUpdate(m.chat, [users], "promote");
            await reply(`✅ Promoted @${users.split('@')[0]}`);
        }
    },

    // DEMOTE
    {
        command: 'demote',
        description: 'Demote admin to member',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, groupAdmins, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            let users = m.quoted?.sender || m.mentionedJid?.[0];
            if (!users) return await reply("❌ Mention user");
            if (!groupAdmins.includes(users)) return await reply("⚠️ Not admin");
            await sock.groupParticipantsUpdate(m.chat, [users], "demote");
            await reply(`✅ Demoted @${users.split('@')[0]}`);
        }
    },

    // KICK
    {
        command: 'kick',
        description: 'Remove member from group',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            let users = m.quoted?.sender || m.mentionedJid?.[0];
            if (!users) return await reply("❌ Mention user");
            await sock.groupParticipantsUpdate(m.chat, [users], "remove");
            await reply(`✅ Removed @${users.split('@')[0]}`);
        }
    },

    // ADD
    {
        command: 'add',
        description: 'Add member to group',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, q, prefix, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            if (!q || isNaN(q)) return await reply(`Usage: ${prefix}add 254712345678`);
            const userToAdd = `${q}@s.whatsapp.net`;
            let response = await sock.groupParticipantsUpdate(m.chat, [userToAdd], "add");
            if (response[0].status === 200) {
                await reply(`✅ Added ${q}`);
            } else {
                await reply("❌ Failed to add");
            }
        }
    },

    // TAGALL
    {
        command: 'tagall',
        description: 'Tag all group members',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, participants, groupName, q, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            
            let emojis = ['🍇', '🌻', '🎗️', '🔮', '❤‍🩹', '🦋', '☃️', '🩵', '🍓', '💗', '📖', '🪩'];
            let emoji = emojis[Math.floor(Math.random() * emojis.length)];
            let msg = q || "ATTENTION";
            let teks = `*GROUP: ${groupName}*\n*MEMBERS: ${participants.length}*\n*MESSAGE: ${msg}*\n\n`;
            for (let mem of participants) {
                teks += `${emoji} @${mem.id.split('@')[0]}\n`;
            }
            await sock.sendMessage(m.chat, { text: teks, mentions: participants.map(a => a.id) }, { quoted: m });
        }
    },

    // HIDETAG
    {
        command: 'hidetag',
        description: 'Tag all without showing list',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, participants, q, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            
            if (!q) return await reply("❌ Provide message");
            await sock.sendMessage(m.chat, { text: q, mentions: participants.map(a => a.id) }, { quoted: m });
        }
    },

    // GROUPINFO
    {
        command: 'groupinfo',
        description: 'Get group information',
        category: 'group',
        execute: async (sock, m, params) => {
            const { participants, groupName, groupMetadata, groupOwner, reply } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            let ppUrl;
            try { ppUrl = await sock.profilePictureUrl(m.chat, 'image'); } 
            catch { ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; }
            const admins = participants.filter(p => p.admin);
            const listAdmin = admins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
            const gdata = `*「 GROUP INFO 」*\n\n*Name:* ${groupName}\n*Members:* ${participants.length}\n*Admins:* ${admins.length}\n*Owner:* @${groupOwner.split('@')[0]}\n*Desc:* ${groupMetadata.desc || 'None'}\n\n*Admins:*\n${listAdmin}`;
            await sock.sendMessage(m.chat, { image: { url: ppUrl }, caption: gdata, mentions: [...admins.map(a => a.id), groupOwner] }, { quoted: m });
        }
    },

    // INVITE
    {
        command: 'invite',
        description: 'Get group invite link',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            const code = await sock.groupInviteCode(m.chat);
            await reply(`🖇️ *Group Link*\n\nhttps://chat.whatsapp.com/${code}`);
        }
    },

    // REVOKE
    {
        command: 'revoke',
        description: 'Reset group invite link',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            await sock.groupRevokeInvite(m.chat);
            await reply("✅ Link reset");
        }
    },

    // MUTE
    {
        command: 'mute',
        description: 'Mute group (admins only)',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            await sock.groupSettingUpdate(m.chat, "announcement");
            await reply("🔇 Group muted");
        }
    },

    // UNMUTE
    {
        command: 'unmute',
        description: 'Unmute group (everyone)',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            await sock.groupSettingUpdate(m.chat, "not_announcement");
            await reply("🔊 Group unmuted");
        }
    },

    // SETNAME
    {
        command: 'setname',
        description: 'Change group name',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, q, prefix, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            if (!q) return await reply(`Usage: ${prefix}setname New Name`);
            await sock.groupUpdateSubject(m.chat, q);
            await reply(`✅ Name updated to: *${q}*`);
        }
    },

    // SETDESC
    {
        command: 'setdesc',
        description: 'Change group description',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, q, prefix, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            if (!q) return await reply(`Usage: ${prefix}setdesc Description`);
            await sock.groupUpdateDescription(m.chat, q);
            await reply("✅ Description updated");
        }
    },

    // LOCK
    {
        command: 'lock',
        description: 'Lock group settings',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            await sock.groupSettingUpdate(m.chat, "locked");
            await reply("🔒 Settings locked");
        }
    },

    // UNLOCK
    {
        command: 'unlock',
        description: 'Unlock group settings',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            if (!adminCheck.isBotAdmin) return await reply("❌ Need admin");
            
            await sock.groupSettingUpdate(m.chat, "unlocked");
            await reply("🔓 Settings unlocked");
        }
    },

    // DELETE
    {
        command: 'delete',
        description: 'Delete a message',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply, sender } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            
            const adminCheck = await isAdmin(sock, m.chat, sender);
            if (!adminCheck.isSenderAdmin && !isCreator) return;
            
            if (!m.quoted) return await reply("❌ Reply to message");
            await sock.sendMessage(m.chat, { delete: m.quoted.key });
        }
    },

    // JOIN (Owner)
    {
        command: 'join',
        description: 'Join group via link',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, q, prefix, reply } = params;
            if (!isCreator) return;
            if (!q) return await reply(`Usage: ${prefix}join <link>`);
            if (!q.includes('chat.whatsapp.com')) return await reply("❌ Invalid link");
            let code = q.split('https://chat.whatsapp.com/')[1];
            await sock.groupAcceptInvite(code);
            await reply("✅ Joined group");
        }
    },
    
    {
    command: 'antilink',
    description: 'Configure antilink protection',
    category: 'group',
    execute: async (sock, m, params) => {
        const { isCreator, q, prefix, reply, sender } = params;
        if (!m.isGroup) return await reply("❌ Groups only");
        
        // Check if user is admin
        const adminCheck = await isAdmin(sock, m.chat, sender);
        if (!adminCheck.isSenderAdmin && !isCreator) {
            return await reply("```For Group Admins Only!```");
        }

        const args = q ? q.toLowerCase().trim().split(' ') : [];
        const action = args[0];
        const status = args[1];

        const usage = `\`\`\`ANTILINK SETUP\n\nUsage:\n${prefix}antilink\n(to see current status)\n${prefix}antilink [kick|delete|warn] on\n${prefix}antilink [kick|delete|warn] off\n\`\`\``;

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
                await reply(`*_Antilink has been turned ON with action set to ${action}_*`);
            } else {
                await reply('*_Failed to turn on Antilink_*');
            }
        } else if (status === 'off') {
            await removeAntilink(m.chat, 'on');
            await reply('*_Antilink has been turned OFF_*');
        } else {
            await reply(usage);
        }
    }
},
    
    // LEAVE (Owner)
    {
        command: 'leave',
        description: 'Leave the group',
        category: 'group',
        execute: async (sock, m, params) => {
            const { isCreator, reply } = params;
            if (!m.isGroup) return await reply("❌ Groups only");
            if (!isCreator) return;
            await reply("👋 Goodbye!");
            setTimeout(async () => {
                await sock.groupLeave(m.chat);
            }, 2000);
        }
    }
];