// plugins/gpt.js

// If your config already exports stuff, you can use it too
const config = require('../settings/config');

// Lazy import for node-fetch (works even if fetch isn't global)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = [
  {
    command: 'gpt',
    alias: ['ai', 'chatgpt', 'gpt4'],
    description: 'Ask the AI anything (.gpt your question)',
    category: 'ai',

    /**
     * @param {import('@whiskeysockets/baileys').WASocket} sock
     * @param {object} m – raw message
     * @param {object} ctx – helper context from your message handler
     */
    execute: async (sock, m, ctx) => {
      const { q, reply, sender } = ctx;

      try {
        if (!q) {
          return reply(
            `🧠 *AI Chat*\n\n` +
            `Use:\n`.concat(
              `.gpt Who are you?\n`,
              `.gpt Write a short quote about success`
            )
          );
        }

        // 1) Get API key from env or config
        const apiKey =
          process.env.OPENAI_API_KEY ||        // recommended: put in .env
          process.env.GPT_KEY ||               // optional alt name
          config.OPENAI_API_KEY ||             // if you add it in config
          null;

        if (!apiKey) {
          return reply(
            '⚠️ *Owner setup required*\n\n' +
            'Set your OpenAI key in `.env` as:\n' +
            '`OPENAI_API_KEY=your_key_here`\n\n' +
            'If you do not have a key, use .gpt4 command instead.'
          );
        }

        // 2) Build request payload
        const body = {
          model: 'gpt-4o-mini', // good, cheap model name
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful WhatsApp bot assistant called "THE STIAN". ' +
                'Answer briefly, clearly and safely. Avoid markdown tables.',
            },
            {
              role: 'user',
              content: q,
            },
          ],
          max_tokens: 350,
        };

        // 3) Call OpenAI API
        await reply('⏳ *Thinking…*');

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('OpenAI error:', res.status, txt);
          return reply(
            `❌ API error (status ${res.status}).\n` +
            `Tell the owner to check the API key / billing.`
          );
        }

        const json = await res.json().catch(() => null);
        const answer =
          json?.choices?.[0]?.message?.content?.trim() ||
          "Sorry, I couldn't generate a response.";

        // 4) Send answer
        await sock.sendMessage(m.chat, {
          text:
            `🤖 *GPT Reply*\n\n` +
            `${answer}\n\n` +
            `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ sᴛɪᴀɴ`,
        }, { quoted: m });

      } catch (err) {
        console.error('GPT plugin error:', err);
        await reply(
          `❌ *Error talking to AI*\n\n` +
          `${err.message || err}`
        );
      }
    }
  },
  {
    command: 'dalle',
    alias: ['gptimg', 'aiimage', 'img'],
    description: 'Generate an AI image from a text prompt',
    category: 'ai',

    /**
     * @param {import('@whiskeysockets/baileys').WASocket} sock
     * @param {Object} m      Raw message
     * @param {Object} ctx    Parsed helpers (q, reply, etc – same as gpt.js)
     */
    execute: async (sock, m, ctx) => {
      const { q, reply } = ctx;

      try {
        // 1) Require a prompt
        if (!q) {
          return reply(
            '🖼️ *AI Image Generator*\n\n' +
            'Usage examples:\n' +
            '`.dalle a dragon flying over Nairobi at sunset`\n' +
            '`.gptimg futuristic neon city at night`\n'
          );
        }

        // 2) Get API key (same logic as gpt.js)
        const apiKey = config.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return reply(
            '⚠️ *OpenAI API key missing!*\n\n' +
            'Set `OPENAI_API_KEY` in your `.env` or `settings/config.js` first.'
          );
        }

        // 3) Small “drawing” reaction
        await sock.sendMessage(m.chat, {
          react: { text: '🎨', key: m.key }
        });

        // 4) Call OpenAI image API
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'dall-e-3',   // you can change model if you want
            prompt: q,
            n: 1,
            size: '1024x1024'    // 512x512 / 1024x1024 / 1024x1792 etc.
          })
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('OpenAI image error:', res.status, text);
          return reply(`❌ Image API error (status ${res.status}).`);
        }

        const data = await res.json().catch(() => ({}));
        const imageUrl = data?.data?.[0]?.url;

        if (!imageUrl) {
          console.error('Unexpected image response:', data);
          return reply('❌ Could not get image URL from API.');
        }

        // 5) Send the image back
        await sock.sendMessage(
          m.chat,
          {
            image: { url: imageUrl },
            caption: `🖼️ *AI Image*\n\nPrompt: _${q}_\n> 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉`
          },
          { quoted: m }
        );

        // 6) Success reaction
        await sock.sendMessage(m.chat, {
          react: { text: '✅', key: m.key }
        });
      } catch (err) {
        console.error('dalle/gptimg plugin error:', err);
        await reply('❌ Error generating image, please try again later.');
      }
    }
  }
];