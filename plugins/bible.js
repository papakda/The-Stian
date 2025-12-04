const axios = require('axios');

module.exports = {
    command: 'bible',
    description: 'Get Bible Verses',
    category: 'religion',
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
        config: cmdConfig,
        sender
    }) => {
        try {
            if (!text) {
                return await reply("📖 Usage!\nExample `.bible John 3:16`");
            }

            // Fixed: Changed 'query' to 'text'
            const apiUrl = `https://apis.davidcyriltech.my.id/bible?reference=${encodeURIComponent(text)}`;
            // Fixed: Changed 'url' to 'apiUrl'
            const res = await axios.get(apiUrl);

            if (!res.data.success) {
                return await reply("❌ Could not fetch the verse. Please check the reference.");
            }

            const { reference, translation, text: verseText } = res.data;

            // Fixed: Changed variable name from 'reply' to 'message' to avoid conflict
            const message = `📖 *${reference}* (${translation})\n\n${verseText}`;
            return await reply(message);

        } catch (err) {
            await reply("⚠️ Error fetching verse. Try again later.");
            console.error("Bible command error:", err.message);
        }
    }
};