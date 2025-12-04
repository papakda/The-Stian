// plugins/pmblocker.js
const fs = require('fs');
const path = require('path');
// The Stian
const isOwnerOrSudo = require('../lib/isOwner'); 

const PMBLOCKER_PATH = './data/pmblocker.json';

// --- Helper Functions ---
function readState() {
  try {
    if (!fs.existsSync(PMBLOCKER_PATH)) {
      return { 
        enabled: false, 
        message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' 
      };
    }
    const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
    const data = JSON.parse(raw || '{}');
    return {
      enabled: !!data.enabled,
      message: typeof data.message === 'string' && data.message.trim() 
        ? data.message 
        : '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.'
    };
  } catch {
    return { enabled: false, message: '⚠️ Direct messages are blocked!' };
  }
}

function writeState(enabled, message) {
  try {
    const dir = path.dirname(PMBLOCKER_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const current = readState();
    const payload = {
      enabled: enabled !== undefined ? !!enabled : current.enabled,
      message: typeof message === 'string' && message.trim() ? message : current.message
    };
    fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
    return payload;
  } catch (err) {
    console.error('Error writing pmblocker state:', err);
  }
}

const processed = new Set();

module.exports = {
  command: 'pmblocker',
  alias: ['antibot', 'blockpm'],
  description: 'Manage the Auto-Blocker for Private Messages.',
  category: 'owner', 

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { args, reply } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      // 🔒 SECURITY CHECK 🔒
      // We check explicitly if the sender is the owner using your lib
      const senderId = m.sender || m.key.participant || m.key.remoteJid;
      const isOwner = await isOwnerOrSudo(senderId, sock, m.chat);

      if (!m.key.fromMe && !isOwner) {
         return reply('❌ *Access Denied:* Only the Bot Owner can use this command.');
      }

      // --- Command Logic ---
      if (!args || args.length === 0) {
        return reply(
          '*🛡️ PM Blocker Configuration*\n\n' +
          '*.pmblocker on* - Enable PM auto-block\n' +
          '*.pmblocker off* - Disable PM blocker\n' +
          '*.pmblocker status* - Show current status\n' +
          '*.pmblocker setmsg <text>* - Set the warning message'
        );
      }

      const sub = args[0].toLowerCase();
      const state = readState();

      switch (sub) {
        case 'on':
          writeState(true, null);
          await sock.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } });
          reply('✅ PM Blocker is now *ENABLED*.');
          break;

        case 'off':
          writeState(false, null);
          await sock.sendMessage(m.chat, { react: { text: '🔓', key: m.key } });
          reply('✅ PM Blocker is now *DISABLED*.');
          break;

        case 'status':
          reply(
            `*📊 PM Blocker Status*\n\n` +
            `*State:* ${state.enabled ? '✅ ON' : '❌ OFF'}\n` +
            `*Message:* ${state.message}`
          );
          break;

        case 'setmsg':
          const newMsg = args.slice(1).join(' ').trim();
          if (!newMsg) return reply('❌ Usage: .pmblocker setmsg <your custom message>');
          writeState(undefined, newMsg);
          reply('✅ PM Blocker warning message updated.');
          break;

        default:
          reply('❌ Invalid option. Use on, off, status, or setmsg.');
      }

    } catch (err) {
      console.error('pmblocker error:', err);
      reply('❌ An error occurred.');
    }
  },
  
  readState // Exported for use in your Main Listener
};