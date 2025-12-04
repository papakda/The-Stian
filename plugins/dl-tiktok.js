/**
 * 🎬 TikTok Downloader (No Watermark)
 * File: dl-tiktok.js
 * Command: .tiktok <url>  (also works if you reply to a message containing a TikTok link)
 *
 * Uses your original API:
 *   https://delirius-apiofc.vercel.ap/download/tiktok?url=<URL>
 *
 * Reactions: 🔍 → ⬇️ → ✅ / ❌
 * No externalAdReply.
 */

const axios = require('axios');

const TIKTOK_REGEX = /(https?:\/\/)?(www\.)?(vm|vt|m)?\.?tiktok\.com\/[^\s]+/i;

module.exports = {
  command: 'tiktok',
  alias: ['ttdl', 'tt', 'tiktokdl'],
  description: 'Download TikTok video without watermark',
  category: 'downloader',

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
      // 1) Get the TikTok URL from args or from a replied message
      let input = (text || '').trim();
      if (!input && quoted?.text) input = quoted.text.trim();
      if (!input && qmsg?.message?.extendedTextMessage?.text) input = qmsg.message.extendedTextMessage.text.trim();

      const match = (input || '').match(TIKTOK_REGEX);
      if (!match) {
        return await reply(
          `❌ Please provide a valid TikTok link.\n` +
          `Example: \`${prefix || '.'}tiktok https://www.tiktok.com/@user/video/123456\``
        );
      }
      const url = match[0];

      // 🔍 searching reaction
      await sock.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

      // 2) Call your API
      const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 30000 });

      if (!data?.status || !data?.data) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return await reply('⚠️ Failed to fetch TikTok video. Try another link.');
      }

      const { title, like, comment, share, author, meta } = data.data;
      const videoMedia = Array.isArray(meta?.media) ? meta.media.find(v => v.type === 'video') : null;
      const videoUrl = videoMedia?.org;

      if (!videoUrl) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return await reply('⚠️ Could not locate the video stream in the response.');
      }

      // ⬇️ downloading/processing reaction (we’ll stream by URL so WA fetches directly)
      await sock.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

      const caption =
        `*❒ The Stian VIDEO DOWNLOADER ❒*\n\n` +
        `👤 *User:* ${author?.nickname || '-'}\n` +
        `♥️ *Likes:* ${like ?? 0}\n` +
        `💬 *Comments:* ${comment ?? 0}\n` +
        `♻️ *Shares:* ${share ?? 0}\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;

      // 3) Send by URL (WhatsApp downloads it; avoids size limits on your server)
      await sock.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption,
        // no externalAdReply used
      }, { quoted: m });

      // ✅ success reaction
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('tiktok downloader error:', e?.message || e);
      try { await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); } catch {}
      await reply(`❌ An error occurred. ${e?.message ? 'Details: ' + e.message : ''}`.trim());
    }
  }
};