// plugins/update.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const isOwner = require('../lib/isOwner');

module.exports = {
  command: 'update',
  alias: ['upgrade', 'pull', 'gitpull'],
  description: 'Pull latest updates from GitHub repository and restart the bot.',
  category: 'owner',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { reply } = ctx;

    // Check if user is owner
    if (!isOwner(m.sender)) {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return reply('❌ *Access Denied!*\n\nThis command is only for the bot owner.');
    }

    try {
      // Show loading reaction
      await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      await reply('🔄 *Checking for updates...*');

      // Check if .git directory exists
      if (!fs.existsSync('.git')) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply('❌ *Not a Git repository!*\n\nThis bot was not cloned from GitHub.\nPlease use `git clone` to download the repository.');
      }

      // Get current branch
      let currentBranch;
      try {
        currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      } catch (err) {
        currentBranch = 'main'; // Default to main if error
      }

      await reply(`📌 *Current Branch:* ${currentBranch}\n\n🔍 *Fetching updates...*`);

      // Fetch latest changes
      try {
        execSync('git fetch origin', { encoding: 'utf8', stdio: 'pipe' });
      } catch (err) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply(`❌ *Fetch Failed!*\n\n${err.message}`);
      }

      // Check if there are updates
      let hasUpdates = false;
      try {
        const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const remoteCommit = execSync(`git rev-parse origin/${currentBranch}`, { encoding: 'utf8' }).trim();
        hasUpdates = localCommit !== remoteCommit;
      } catch (err) {
        // Continue anyway
      }

      if (!hasUpdates) {
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return reply('✅ *Already up to date!*\n\nNo updates available.');
      }

      await reply('📥 *Updates found! Pulling changes...*');

      // Stash local changes (if any)
      try {
        execSync('git stash', { encoding: 'utf8', stdio: 'pipe' });
      } catch (err) {
        // No changes to stash, that's fine
      }

      // Pull updates
      let pullOutput;
      try {
        pullOutput = execSync(`git pull origin ${currentBranch}`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (err) {
        await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return reply(`❌ *Pull Failed!*\n\n\`\`\`${err.message}\`\`\`\n\n💡 Try manually: \`git pull origin ${currentBranch}\``);
      }

      // Get commit log
      let commitLog = '';
      try {
        commitLog = execSync('git log -3 --oneline --decorate', { encoding: 'utf8' }).trim();
      } catch (err) {
        commitLog = 'Unable to fetch commit log';
      }

      // Check for package.json changes (need npm install)
      let needsNpmInstall = false;
      try {
        const diffOutput = execSync('git diff HEAD@{1} HEAD --name-only', { encoding: 'utf8' });
        needsNpmInstall = diffOutput.includes('package.json');
      } catch (err) {
        // Continue
      }

      // Install dependencies if needed
      if (needsNpmInstall) {
        await reply('📦 *Installing dependencies...*');
        try {
          execSync('npm install', { encoding: 'utf8', stdio: 'pipe' });
          await reply('✅ *Dependencies installed!*');
        } catch (err) {
          await reply(`⚠️ *Warning:* npm install failed\n\`\`\`${err.message}\`\`\``);
        }
      }

      // Success message
      const successMsg = `╭━━━『 *UPDATE SUCCESS* 』━━━╮
│
│ ✅ *Update Complete!*
│
│ 📋 *Recent Commits:*
│ \`\`\`${commitLog}\`\`\`
│
│ 🔄 *Bot will restart in 3 seconds...*
│
╰━━━━━━━━━━━━━━━━━╯

> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;

      await reply(successMsg);
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Restart the bot
      setTimeout(() => {
        process.exit(0); // Exit and let your process manager (PM2, systemd, etc.) restart it
      }, 3000);

    } catch (error) {
      console.error('Update error:', error);
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      
      const errorMsg = `❌ *Update Failed!*\n\n*Error:* ${error.message}\n\n💡 *Manual Update:*\n\`\`\`bash\ngit pull origin main\nnpm install\n\`\`\``;
      reply(errorMsg);
    }
  }
};