const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: 'save',
  description: 'Save a quoted status and send it to your private inbox',
  category: 'tools',

  execute: async (sock, m, { reply, quoted }) => {
    try {
      // 1. Check if the user replied to a message
      if (!m.quoted) {
        return reply("🍁 Please reply to a *status* (or any media) to save it!");
      }

      // 2. React to indicate processing
      await sock.sendMessage(m.chat, { react: { text: 'Kb', key: m.key } });

      // 3. Determine the message type
      const mime = m.quoted.mimetype || "";
      const isImage = /image/.test(mime);
      const isVideo = /video/.test(mime);
      const isAudio = /audio/.test(mime);

      if (!isImage && !isVideo && !isAudio) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply("❌ Only *image, video, or audio* messages are supported.");
      }

      // 4. Download the media
      const messageType = isImage ? 'imageMessage' : isVideo ? 'videoMessage' : 'audioMessage';
      
      const buffer = await downloadMediaMessage(
        { message: m.quoted.message || { [messageType]: m.quoted } },
        "buffer",
        {},
        { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
      );

      if (!buffer) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply("❌ Failed to download media!");
      }

      // 5. Send the media to the User's Inbox (m.sender)
      if (isImage) {
        await sock.sendMessage(m.sender, { 
            image: buffer, 
            caption: m.quoted.text || "" 
        });
      } else if (isVideo) {
        await sock.sendMessage(m.sender, { 
            video: buffer, 
            caption: m.quoted.text || "" 
        });
      } else if (isAudio) {
        await sock.sendMessage(m.sender, { 
            audio: buffer, 
            mimetype: mime, 
            ptt: false 
        });
      }

      // 6. Success reaction & Confirmation in the group
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      // Optional: Tell the user in the group that it was sent
      // await reply('✅ Check your inbox!'); 

    } catch (err) {
      console.error("Save Command Error:", err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply("❌ Error saving message.");
    }
  }
};