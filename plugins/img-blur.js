// plugins/blur.js
const sharp = require('sharp');

// prevent double-processing
const processed = new Set();

module.exports = {
  command: 'blur',
  alias: ['censored', 'blurimg'],
  description: 'Apply a blur effect to an image.',
  category: 'editor',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { quoted, reply, mime } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      // 1) Validate: User must reply to an image or send an image with caption
      // We check if the quoted message is an image, or if the message itself is an image
      const isQuotedImage = quoted ? /image/.test(quoted.mtype || quoted.mediaType || mime) : false;
      const isMessageImage = /image/.test(mime);

      if (!isQuotedImage && !isMessageImage) {
        return reply('📌 Please reply to an image or send an image with the caption *.blur*');
      }

      // React loading
      await sock.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

      // 2) Download the buffer
      // If quoted, download quoted. If not quoted but is image, download the message itself (m).
      let imgBuffer = false;
      
      if (isQuotedImage) {
        imgBuffer = await quoted.download();
      } else if (isMessageImage) {
        imgBuffer = await m.download(); // Assuming your 'm' object has download helper, otherwise use standard downloadMediaMessage
      }

      if (!imgBuffer) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply('❌ Failed to download image.');
      }

      // 3) Process with Sharp
      // Resize to 800x800 max to save resources, then blur
      const blurredImage = await sharp(imgBuffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .blur(10) // Blur level 10
        .toBuffer();

      // 4) Send Result
      await sock.sendMessage(
        m.chat,
        {
          image: blurredImage,
          caption: '*[ ✔ ] Image Blurred Successfully*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍',
          // Optional: Add context info for "Forwarded" look if desired
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true
          }
        },
        { quoted: m }
      );

      // Done
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('blur command error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ Failed to blur image. Ensure "sharp" is installed correctly.');
    }
  }
};