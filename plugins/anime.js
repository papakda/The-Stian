const axios = require('axios');

module.exports = [
    // Random Anime Image (BA)
    {
        command: 'anime',
        description: 'Generate random anime images',
        category: 'fun',
        execute: async (sock, m, params) => {
            const { reply, prefix } = params;
            
            try {
                await sock.sendMessage(m.chat, { 
                    react: { text: "🎨", key: m.key } 
                });

                const generatingMsg = await sock.sendMessage(m.chat, {
                    text: '🎨 *Generating random anime image...*'
                });

                const imageUrl = 'https://hector-api.vercel.app/random/ba';

                // Send anime image
                await sock.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: `🎨 *RANDOM ANIME IMAGE*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });

                // Delete the generating message
                await sock.sendMessage(m.chat, {
                    delete: generatingMsg.key
                });

                await sock.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });

            } catch (error) {
                console.error('Error in anime command:', error);
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                await reply('❌ An error occurred while generating anime image. Please try again.');
            }
        }
    },

    // Waifu Image Generator
    {
        command: 'waifu',
        description: 'Generate random waifu images',
        category: 'fun',
        execute: async (sock, m, params) => {
            const { reply, prefix } = params;
            
            try {
                await sock.sendMessage(m.chat, { 
                    react: { text: "💕", key: m.key } 
                });

                const generatingMsg = await sock.sendMessage(m.chat, {
                    text: '💕 *Generating random waifu image...*'
                });

                let waifuData = null;

                try {
                    const apiUrl = 'https://delirius-apiofc.vercel.app/anime/waifu';
                    const res = await axios.get(apiUrl, { timeout: 30000 });
                    
                    console.log('Waifu API Response:', res.data);
                    
                    if (res.data && res.data.status && res.data.data) {
                        waifuData = res.data.data;
                    }
                } catch (error) {
                    console.log('Waifu API error:', error.message);
                }

                if (!waifuData || !waifuData.image) {
                    await sock.sendMessage(m.chat, {
                        text: '❌ Failed to generate waifu image. Please try again later.',
                        edit: generatingMsg.key
                    });
                    
                    await sock.sendMessage(m.chat, { 
                        react: { text: "❌", key: m.key } 
                    });
                    return;
                }

                // Format caption with waifu details
                let caption = `💕 *RANDOM WAIFU*\n\n`;
                if (waifuData.title) caption += `📝 *Title:* ${waifuData.title}\n`;
                if (waifuData.likes) caption += `❤️ *Likes:* ${waifuData.likes}\n`;
                if (waifuData.source) caption += `🔗 *Source:* ${waifuData.source}\n`;
                caption += `\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;

                // Send waifu image
                await sock.sendMessage(m.chat, {
                    image: { url: waifuData.image },
                    caption: caption
                }, { quoted: m });

                // Delete the generating message
                await sock.sendMessage(m.chat, {
                    delete: generatingMsg.key
                });

                await sock.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });

            } catch (error) {
                console.error('Error in waifu command:', error);
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                await reply('❌ An error occurred while generating waifu image. Please try again.');
            }
        }
    }
];