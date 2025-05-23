const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: 'mode',
  react: '⚙️',
  desc: 'Toggle bot mode between public and private',
  category: 'owner',
  filename: __filename
}, async (m, { match, isOwner, text, robin }) => {
  if (!isOwner) return m.reply('Only the bot owner can use this command.');

  const mode = match.toLowerCase();

  if (!['public', 'private'].includes(mode)) {
    return m.reply(`Invalid mode.\n\nUse:\n.mode public\n.mode private\n\nCurrent mode: *${config.MODE || 'public'}*`);
  }

  config.MODE = mode;
  m.reply(`✅ Mode successfully changed to *${mode.toUpperCase()}*`);
});
