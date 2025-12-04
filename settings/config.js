
// The Stian Bot Config
// Dev : The Stian

const fs = require('fs')

const config = {
    owner: "The Stian",
    ownerNumber: '254705615631',
    botNumber: "254705615631",
    setPair: "K0MRAID1",
    thumbUrl: "https://files.catbox.moe/6r1qzc.jpg",
    session: "sessions",
    status: {
        public: true,
        terminal: true,
        reactsw: false
    },
    message: {
        owner: "no, this is for owners only",
        group: "this is for groups only",
        admin: "this command is for admin only",
        private: "this is specifically for private chat"
    },
    mess: {
        owner: 'This command is only for the bot owner!',
        done: 'Mode changed successfully!',
        error: 'Something went wrong!',
        wait: 'Please wait...'
    },
    settings: {
        title: "𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍",
        packname: 'The Stian',
        description: "this script was created by Stian",
        author: 'https://github.com/TheStian',
        footer: "> *𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙃𝙀 𝙎𝙏𝙄𝘼𝙉*"
    },
    newsletter: {
        name: "THE STIAN",
        id: "120363422654613125@newsletter"
    },
    api: {
        baseurl: "https://stian-api.vercel.app/",
        apikey: "stian"
    },
    sticker: {
        packname: "The Stian",
        author: "The Stian"
    }
}

config.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
config.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""

module.exports = config;

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
