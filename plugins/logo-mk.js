// plugins/logo-mk.js - Logo and text effect makers
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const axios = require('axios');

// Helper function to fetch logo using fetchJson
async function fetchLogo(apiUrl) {
    try {
        const result = await fetchJson(apiUrl);
        return result;
    } catch (error) {
        console.error('Logo API error:', error);
        return null;
    }
}

module.exports = [
    // 3D COMIC
    {
        command: '3dcomic',
        description: 'Create a 3D Comic-style text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}3dcomic Empire`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🎨 *3D Comic Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // DRAGONBALL
    {
        command: 'dragonball',
        description: 'Create Dragon Ball style text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}dragonball Goku`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🐉 *Dragon Ball Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // DEADPOOL
    {
        command: 'deadpool',
        description: 'Create Deadpool text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}deadpool Wade`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `💀 *Deadpool Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // BLACKPINK
    {
        command: 'blackpink',
        description: 'Create Blackpink style text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}blackpink Lisa`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🖤💗 *Blackpink Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // NEON LIGHT
    {
        command: 'neonlight',
        description: 'Create neon light text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}neonlight Neon`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `💡 *Neon Light Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // FOGGY GLASS
    {
        command: 'foggy',
        description: 'Create foggy glass text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}foggy Text`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🌫️ *Foggy Glass Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // WET GLASS
    {
        command: 'wetglass',
        description: 'Create wet glass text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}wetglass Sad`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `💧 *Wet Glass Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // PORNHUB
    {
        command: 'pornhub',
        description: 'Create Pornhub style text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}pornhub Logo`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🔞 *Pornhub Style Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // NARUTO
    {
        command: 'naruto',
        description: 'Create Naruto text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}naruto Uzumaki`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🍥 *Naruto Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // THOR
    {
        command: 'thor',
        description: 'Create Thor text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}thor Odinson`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `⚡ *Thor Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // AMERICA
    {
        command: 'america',
        description: 'Create American flag text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}america USA`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🇺🇸 *American Flag Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // ERASER
    {
        command: 'eraser',
        description: 'Create eraser text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}eraser Delete`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🧹 *Eraser Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // 3D PAPER
    {
        command: '3dpaper',
        description: 'Create 3D paper cut text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}3dpaper Paper`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `📄 *3D Paper Cut Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    },

    // FUTURISTIC
    {
        command: 'futuristic',
        description: 'Create futuristic text effect',
        category: 'logo',
        execute: async (sock, m, params) => {
            const { q, prefix, reply } = params;
            try {
                if (!q) return await reply(`❌ Please provide text.\nExample: ${prefix}futuristic Future`);
                
                await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html&name=${encodeURIComponent(q)}`;
                const result = await fetchLogo(apiUrl);
                
                if (!result?.result?.download_url) {
                    await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return await reply("❌ Failed to generate logo.");
                }
                
                await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await sock.sendMessage(m.chat, { 
                    image: { url: result.result.download_url },
                    caption: `🚀 *Futuristic Text Effect*\n\n> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`
                }, { quoted: m });
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                await reply(`❌ Error: ${e.message}`);
            }
        }
    }
];