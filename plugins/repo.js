const axios = require('axios');

module.exports = {
  command: 'repo',
  description: 'Get source code and repository stats for THE STIAN',
  category: 'general',

  execute: async (sock, m, { reply }) => {
    try {
      // 1. React to show processing
      await sock.sendMessage(m.chat, { react: { text: '📂', key: m.key } });

      // 2. Fetch Repository Data from GitHub API
      const repoUrl = 'https://api.github.com/repos/TheStian/The-Stian';
      const response = await axios.get(repoUrl);
      const repo = response.data;

      // 3. Format the Date (Last Updated)
      const lastUpdate = new Date(repo.updated_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // 4. Construct the caption
      const caption = `╭─── 〔 *𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍* 〕 ───\n` +
                      `│\n` +
                      `│ 📁 *Name:* ${repo.name}\n` +
                      `│ 👤 *Owner:* ${repo.owner.login}\n` +
                      `│ ⭐ *Stars:* ${repo.stargazers_count}\n` +
                      `│ 🍴 *Forks:* ${repo.forks_count}\n` +
                      `│ ⌚ *Updated:* ${lastUpdate}\n` +
                      `│\n` +
                      `│ 🔗 *Link:* ${repo.html_url}\n` +
                      `│\n` +
                      `╰─────────────────`;

      // 5. WORKAROUND: Powered by Stian
      // This sends the owner's avatar as the image, with the stats as the caption.
      await sock.sendMessage(m.chat, { 
        image: { url: repo.owner.avatar_url }, 
        caption: caption
      }, { quoted: m });

      // 6. Success Reaction
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('Repo command error:', err);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return reply('⚠️ Could not fetch repository data. Check the console for errors.');
    }
  }
};