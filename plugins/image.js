const axios = require('axios');

module.exports = {
    command: 'img',
    alias: ['image', 'gimage', 'googleimage'],
    description: 'Search and download images from Google',
    category: 'downloader',
    execute: async (sock, m, params) => {
        const { q, prefix, reply } = params;

        if (!q) {
            return await reply(
                '❌ *Please provide a search query!*\n\n' +
                `💡 Example: ${prefix}img Cat`
            );
        }

        try {
            // Send searching reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "🔍", key: m.key } 
            });

            await reply('🔎 *Searching for images...* 📸');

            // Try multiple APIs as fallbacks
            let images = [];
            
            // API 1: Try gis API
            try {
                const apiUrl1 = `https://api.siputzx.my.id/api/search/gis?query=${encodeURIComponent(q)}`;
                const { data: data1 } = await axios.get(apiUrl1);
                
                if (data1.status && data1.data && Array.isArray(data1.data) && data1.data.length > 0) {
                    images = data1.data.slice(0, 5);
                }
            } catch (err) {
                console.error('API 1 failed:', err.message);
            }

            // API 2: If first API failed, try alternative
            if (images.length === 0) {
                try {
                    const apiUrl2 = `https://api.popcat.xyz/google-image?q=${encodeURIComponent(q)}`;
                    const { data: data2 } = await axios.get(apiUrl2);
                    
                    if (data2 && Array.isArray(data2) && data2.length > 0) {
                        images = data2.slice(0, 5).map(img => img.url || img);
                    }
                } catch (err) {
                    console.error('API 2 failed:', err.message);
                }
            }

            // API 3: Last fallback
            if (images.length === 0) {
                try {
                    const apiUrl3 = `https://api.nexoracle.com/search/google-image?apikey=free_key@maher_apis&q=${encodeURIComponent(q)}`;
                    const { data: data3 } = await axios.get(apiUrl3);
                    
                    if (data3.status && data3.result && Array.isArray(data3.result) && data3.result.length > 0) {
                        images = data3.result.slice(0, 5).map(img => img.url || img);
                    }
                } catch (err) {
                    console.error('API 3 failed:', err.message);
                }
            }

            if (images.length === 0) {
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return await reply('❌ *No images found!* Try another search term or try again later.');
            }

            // Update reaction to downloading
            await sock.sendMessage(m.chat, { 
                react: { text: "⬇️", key: m.key } 
            });

            // Send each image
            let successCount = 0;
            for (let i = 0; i < images.length; i++) {
                try {
                    const imageUrl = typeof images[i] === 'string' ? images[i] : images[i].url || images[i].image;
                    
                    if (imageUrl) {
                        await sock.sendMessage(m.chat, {
                            image: { url: imageUrl },
                            caption: `🖼️ *Image ${successCount + 1}*\n\n🔎 Query: ${q}\n\n> 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉`
                        }, { quoted: m });
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Failed to send image ${i + 1}:`, err.message);
                }
            }

            if (successCount === 0) {
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return await reply('❌ *Failed to send images!* Please try again.');
            }

            // Success reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error('Image search error:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply(`❌ *Error:* ${error.message || 'Failed to search images. Please try again.'}`);
        }
    }
};