/**
 * 🔁 View-Once Saver (.vv)
 * Structured to your .play2 format
 * Sends the recovered media back into the same chat.
 *
 * Usage:
 *   .vv            -> normal mode (shows reactions)
 *   .vv silent     -> silent mode (no text or reactions)
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'vv2',
  description: 'Reveal and resend view-once media (image/video) into the same chat',
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
    const silent = Array.isArray(args) && args.includes('silent');

    try {
      // 🔹 Get the quoted message (same logic as your helper)
      const quotedMsg = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const viewOnce = (quotedMsg?.viewOnceMessageV2?.message)
                    || (quotedMsg?.viewOnceMessageV2Extension?.message)
                    || quotedMsg;

      const quotedImage = viewOnce?.imageMessage;
      const quotedVideo = viewOnce?.videoMessage;

      if (!quotedImage && !quotedVideo) {
        if (!silent) await reply('❌ Please reply to a *view-once* image or video.');
        return;
      }

      if (!silent) await sock.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

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
        // 🔹 Send it right back to the same chat
        await sock.sendMessage(m.chat, content, { quoted: m });
      }

      if (!silent) await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      if (!silent) {
        try { await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); } catch {}
        await reply('⚠️ Failed to process view-once media.');
      }
      console.error('vv (structured same-chat) error:', err?.message || err);
    }
  }
};