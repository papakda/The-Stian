/**
 * 🔄 Auto-View Status toggle
 * Usage:
 * .autoviewstatus on
 * .autoviewstatus off
 * .autoviewstatus status   (shows current state)
 * The Stian
 * Persists a small JSON
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner'); // Import owner check

const STORE_PATH = path.join(process.cwd(), 'data');
const FLAG_FILE  = path.join(STORE_PATH, 'autoview_status.json');

function readFlag() {
  try {
    if (!fs.existsSync(FLAG_FILE)) return { enabled: false };
    return JSON.parse(fs.readFileSync(FLAG_FILE, 'utf8')) || { enabled: false };
  } catch {
    return { enabled: false };
  }
}

function writeFlag(enabled) {
  if (!fs.existsSync(STORE_PATH)) fs.mkdirSync(STORE_PATH, { recursive: true });
  fs.writeFileSync(FLAG_FILE, JSON.stringify({ enabled }, null, 2), 'utf8');
  return { enabled };
}

module.exports = {
  command: 'autostatusview',
  alias: ['autosw', 'statusview', 'viewstatus'],
  description: 'Automatically mark incoming WhatsApp Status posts as viewed (Owner Only)',
  category: 'tools', // Changed to owner

  execute: async (sock, m, {
    args,
    prefix,
    reply
  }) => {
    try {
      // 🔒 SECURITY CHECK 🔒
      const senderId = m.sender || m.key.participant || m.key.remoteJid;
      const isOwner = await isOwnerOrSudo(senderId, sock, m.chat);

      if (!m.key.fromMe && !isOwner) {
         return reply('❌ *Access Denied:* Only the Bot Owner can use this command.');
      }

      const subcmd = (args?.[0] || '').toLowerCase();

      await sock.sendMessage(m.chat, { react: { text: '🔧', key: m.key } });

      // Check current status before making changes
      const currentStatus = readFlag();

      if (subcmd === 'on') {
        if (currentStatus.enabled) {
          await reply('⚠️ Auto-view Status is already *ACTIVATED*.');
          await sock.sendMessage(m.chat, { react: { text: '🤷‍♂️', key: m.key } });
          return;
        }

        writeFlag(true);
        await reply('✅ Auto-view Status: *ON*');
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;
      }

      if (subcmd === 'off') {
        if (!currentStatus.enabled) {
          await reply('⚠️ Auto-view Status is already *DEACTIVATED*.');
          await sock.sendMessage(m.chat, { react: { text: '🤷‍♂️', key: m.key } });
          return;
        }

        writeFlag(false);
        await reply('✅ Auto-view Status: *OFF*');
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;
      }

      if (subcmd === 'status') {
        await reply(`ℹ️ Auto-view Status is currently: *${currentStatus.enabled ? 'ON' : 'OFF'}*`);
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;
      }

      await sock.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
      await reply(
        `Usage:\n` +
        `• \`${prefix}autoviewstatus on\`\n` +
        `• \`${prefix}autoviewstatus off\`\n` +
        `• \`${prefix}autoviewstatus status\``
      );
    } catch (err) {
      console.error('autoviewstatus plugin error:', err);
      try { await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); } catch {}
      await reply('⚠️ Failed to change auto-view setting.');
    }
  }
};