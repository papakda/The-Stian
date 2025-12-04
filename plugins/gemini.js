const axios = require('axios');

module.exports = {
    command: 'gemini',
    alias: ['bard', 'ai', 'chat'],
    description: 'Chat with Google Gemini Pro',
    category: 'ai',
    execute: async (sock, m, params) => {
        const { q, prefix, reply } = params;

        if (!q) {
            return await reply(
                '❌ *Please provide a question!*\n\n' +
                `💡 Example: ${prefix}gemini Explain Quantum Physics`
            );
        }

        try {
            // 1. Send "Thinking" Reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "🧠", key: m.key } 
            });

            // 2. Simulate Typing (Makes it look real)
            await sock.sendPresenceUpdate('composing', m.chat);

            let result = null;
            
            // --- API 1: Siputzx (Primary) ---
            try {
                const apiUrl1 = `https://api.siputzx.my.id/api/ai/gemini?content=${encodeURIComponent(q)}`;
                const { data: data1 } = await axios.get(apiUrl1);
                
                if (data1 && data1.data) {
                    result = data1.data;
                }
            } catch (err) {
                console.error('Gemini API 1 failed:', err.message);
            }

            // --- API 2: Hercai (Fallback) ---
            if (!result) {
                try {
                    const apiUrl2 = `https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(q)}`;
                    const { data: data2 } = await axios.get(apiUrl2);
                    
                    if (data2 && data2.reply) {
                        result = data2.reply;
                    }
                } catch (err) {
                    console.error('Gemini API 2 failed:', err.message);
                }
            }

            // --- API 3: Popcat (Last Resort) ---
            if (!result) {
                try {
                    // Using generic chatbot if Gemini fails
                    const apiUrl3 = `https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(q)}&owner=Stian&botname=Gemini`;
                    const { data: data3 } = await axios.get(apiUrl3);
                    
                    if (data3 && data3.response) {
                        result = data3.response;
                    }
                } catch (err) {
                    console.error('Gemini API 3 failed:', err.message);
                }
            }

            // Check if we found an answer
            if (!result) {
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return await reply('❌ *System Error:* All AI servers are busy. Please try again later.');
            }

            // 3. Send the Response
            await sock.sendMessage(m.chat, {
                text: `✨ *GEMINI AI* ✨\n\n${result}\n\n> 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉`
            }, { quoted: m });

            // 4. Success Reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "🤖", key: m.key } 
            });

        } catch (error) {
            console.error('Gemini command error:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply(`❌ *Error:* ${error.message}`);
        }
    }
};