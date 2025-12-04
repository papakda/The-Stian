const axios = require('axios');

module.exports = [
    // TinyURL Command
    {
        command: 'tinyurl',
        description: 'Shorten URLs using TinyURL',
        category: 'other',
        execute: async (sock, m, params) => {
            const { args, reply, prefix } = params;
            
            try {
                const url = args.join(' ');
                
                if (!url) {
                    return await reply(`🔗 *TINYURL SHORTENER*\n\n*Usage:* ${prefix}tinyurl <url>\n\n*Example:*\n${prefix}tinyurl https://www.example.com/very/long/url`);
                }

                // Basic URL validation
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    return await reply('❌ Please provide a valid URL starting with http:// or https://');
                }

                await sock.sendMessage(m.chat, { 
                    react: { text: "🔗", key: m.key } 
                });

                const shorteningMsg = await sock.sendMessage(m.chat, {
                    text: '🔗 *Shortening with TinyURL...*'
                });

                let shortUrl = null;

                try {
                    const apiUrl = `https://delirius-apiofc.vercel.app/shorten/tinyurl?url=${encodeURIComponent(url)}`;
                    const res = await axios.get(apiUrl, { timeout: 15000 });
                    
                    console.log('TinyURL API Response:', res.data);
                    
                    if (res.data && res.data.status && res.data.data) {
                        shortUrl = res.data.data;
                    }
                } catch (error) {
                    console.log('TinyURL API error:', error.message);
                }

                if (!shortUrl) {
                    await sock.sendMessage(m.chat, {
                        text: '❌ *Failed to shorten URL*\n\nTinyURL service is currently unavailable. Please try again later.',
                        edit: shorteningMsg.key
                    });
                    
                    await sock.sendMessage(m.chat, { 
                        react: { text: "❌", key: m.key } 
                    });
                    return;
                }

                const responseText = `🔗 *TINYURL SHORTENED*\n\n📎 *Original URL:*\n${url}\n\n✅ *Short URL:*\n${shortUrl}\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;

                await sock.sendMessage(m.chat, {
                    text: responseText,
                    edit: shorteningMsg.key
                });

                await sock.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });

            } catch (error) {
                console.error('Error in tinyurl command:', error);
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                await reply('❌ An error occurred while shortening the URL. Please try again.');
            }
        }
    },
    
    // Is.gd Command
    {
        command: 'isgd',
        description: 'Shorten URLs using Is.gd',
        category: 'other',
        execute: async (sock, m, params) => {
            const { args, reply, prefix } = params;
            
            try {
                const url = args.join(' ');
                
                if (!url) {
                    return await reply(`🔗 *IS.GD SHORTENER*\n\n*Usage:* ${prefix}isgd <url>\n\n*Example:*\n${prefix}isgd https://www.example.com/very/long/url`);
                }

                // Basic URL validation
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    return await reply('❌ Please provide a valid URL starting with http:// or https://');
                }

                await sock.sendMessage(m.chat, { 
                    react: { text: "🔗", key: m.key } 
                });

                const shorteningMsg = await sock.sendMessage(m.chat, {
                    text: '🔗 *Shortening with Is.gd...*'
                });

                let shortUrl = null;

                try {
                    const apiUrl = `https://delirius-apiofc.vercel.app/shorten/shorten?url=${encodeURIComponent(url)}`;
                    const res = await axios.get(apiUrl, { timeout: 15000 });
                    
                    console.log('Is.gd API Response:', res.data);
                    
                    if (res.data && res.data.status && res.data.data) {
                        shortUrl = res.data.data;
                    }
                } catch (error) {
                    console.log('Is.gd API error:', error.message);
                }

                if (!shortUrl) {
                    await sock.sendMessage(m.chat, {
                        text: '❌ *Failed to shorten URL*\n\nIs.gd service is currently unavailable. Please try again later.',
                        edit: shorteningMsg.key
                    });
                    
                    await sock.sendMessage(m.chat, { 
                        react: { text: "❌", key: m.key } 
                    });
                    return;
                }

                const responseText = `🔗 *IS.GD SHORTENED*\n\n📎 *Original URL:*\n${url}\n\n✅ *Short URL:*\n${shortUrl}\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;

                await sock.sendMessage(m.chat, {
                    text: responseText,
                    edit: shorteningMsg.key
                });

                await sock.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });

            } catch (error) {
                console.error('Error in isgd command:', error);
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                await reply('❌ An error occurred while shortening the URL. Please try again.');
            }
        }
    }
];