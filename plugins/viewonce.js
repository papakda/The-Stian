/**
 * 🔁 View-Once Saver (.vv) — Structured to your .play2 format
 * Uses your current logic: downloads the replied view-once media
 * and sends it to the bot owner's DM (sock.user.id). 
 * 
 * Usage:
 *   .vv            -> runs with confirmations (reactions)
 *   .vv silent     -> fully silent (no reactions or replies; logs only on failure)
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'vv',
  description: 'Reveal view-once media and forward it privately to bot owner DM',
  category: 'tools',

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
    // Keep compatibility with your helper's "silent" mode
    const silent = Array.isArray(args) && args.includes('silent');

    try {
      // === Get the quoted message (stay faithful to your original logic) ===
      const quotedMsg = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const viewOnce = (quotedMsg?.viewOnceMessageV2?.message) 
                    || (quotedMsg?.viewOnceMessageV2Extension?.message) 
                    || quotedMsg;

      const quotedImage = viewOnce?.imageMessage;
      const quotedVideo = viewOnce?.videoMessage;

      if (!quotedImage && !quotedVideo) {
        if (!silent) await reply('❌ Please reply to a *view-once* image or video.');
        return; // silently ignore if no media
      }

      if (!silent) await sock.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

      const ownerJid = sock?.user?.id;

      let content = null;

      if (quotedImage) {
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        content = {
          image: buffer,
          fileName: 'media.jpg',
          caption: quotedImage.caption || ''
        };
      } else if (quotedVideo) {
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        content = {
          video: buffer,
          fileName: 'media.mp4',
          caption: quotedVideo.caption || ''
        };
      }

      if (content) {
        // Send privately to the bot owner's DM, as in your current helper
        await sock.sendMessage(ownerJid, content);
      }

      if (!silent) await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      if (!silent) {
        try { await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); } catch {}
        await reply('⚠️ Failed to process view-once media.');
      }
      // Always log error like your helper
      console.error('vv (structured) error:', err?.message || err);
    }
  }
};