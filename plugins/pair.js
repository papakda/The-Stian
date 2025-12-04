// plugins/pair.js
const axios = require('axios');
const { sleep } = require('../lib/myfunc');

// prevent double-processing
const processed = new Set();

// Defined here to avoid repetition
const newsletterConfig = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363422654613125@newsletter',
    newsletterName: '𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍 𝐁𝐎𝐓',
    serverMessageId: -1
  }
};

module.exports = {
  command: 'pair',
  alias: ['getcode', 'pairing'],
  description: 'Get a pairing code for a specific WhatsApp number.',
  category: 'tools',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { text, reply } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 5 * 60 * 1000);
      }

      // 1) Validate Input
      if (!text) {
        return await sock.sendMessage(m.chat, {
          text: "Please provide valid WhatsApp number\nExample: *.pair 2547056xxxxx*",
          contextInfo: newsletterConfig
        }, { quoted: m });
      }

      // Clean the number
      const numbers = text.split(',')
        .map((v) => v.replace(/[^0-9]/g, ''))
        .filter((v) => v.length > 5 && v.length < 20);

      if (numbers.length === 0) {
        return await sock.sendMessage(m.chat, {
          text: "Invalid number❌️ Please use the correct format (CountryCode+Number)!",
          contextInfo: newsletterConfig
        }, { quoted: m });
      }

      // 2) Process Number
      for (const number of numbers) {
        const whatsappID = number + '@s.whatsapp.net';
        
        // Check if number exists on WA
        const result = await sock.onWhatsApp(whatsappID);
        if (!result[0]?.exists) {
          return await sock.sendMessage(m.chat, {
            text: `That number is not registered on WhatsApp❗️`,
            contextInfo: newsletterConfig
          }, { quoted: m });
        }

        // Send 'Wait' message
        await sock.sendMessage(m.chat, {
          text: "Wait a moment for the code...",
          contextInfo: newsletterConfig
        }, { quoted: m });

        // 3) API Call
        try {
          const response = await axios.get(`https://the-stian-pair.onrender.com/pair?number=${number}`, { timeout: 60000 });
          
          if (response.data && response.data.code) {
            const code = response.data.code;
            
            if (code === "Service Unavailable") {
              throw new Error('Service Unavailable');
            }
            
            // Wait 5 seconds as requested in original code
            await sleep(5000);

            // Send Code
            await sock.sendMessage(m.chat, {
              text: `Your pairing code: *${code}*`,
              contextInfo: newsletterConfig
            }, { quoted: m });

          } else {
            throw new Error('Invalid response from server');
          }

        } catch (apiError) {
          console.error('API Error:', apiError);
          
          // Send detailed error message with GitHub repo
          const errorMessage = `❌ *Failed to generate pairing code*

The pairing service is currently unavailable. 

📦 *Alternative Solution:*
Deploy your own bot instead! 

🔗 *GitHub Repository:*
https://github.com/TheStian/The-Stian

Deploy from the repo above to get your bot up and running!

> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;
          
          await sock.sendMessage(m.chat, {
            text: errorMessage,
            contextInfo: newsletterConfig
          }, { quoted: m });
        }
      }

    } catch (error) {
      console.error('Pair command error:', error);
      
      // General error message with GitHub repo
      const generalErrorMessage = `❌ *An error occurred*

Something went wrong while processing your request.

📦 *Deploy Your Own Bot:*
Instead of using pairing codes, you can deploy your own bot!

🔗 *GitHub Repository:*
https://github.com/TheStian/The-Stian

Get started by deploying from the repo above!

> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;
      
      await sock.sendMessage(m.chat, {
        text: generalErrorMessage,
        contextInfo: newsletterConfig
      }, { quoted: m });
    }
  }
};