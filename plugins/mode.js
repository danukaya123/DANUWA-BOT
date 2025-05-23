const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "mode",
    desc: "Change bot mode to public or private",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, {
    sender, reply
}) => {
    try {
        // Validate owner
        const isOwner = config.ownerNumber.includes(sender.split('@')[0]);
        if (!isOwner) return reply("❌ This command is only for the bot owner.");

        const mode = (m.body.split(' ')[1] || '').toLowerCase();

        if (!['public', 'private'].includes(mode)) {
            return reply(`⚙️ *Current Mode:* ${config.MODE.toUpperCase()}\n\n_Usage:_\n.mode public\n.mode private`);
        }

        // Update in memory
        config.MODE = mode;

        // Update .env file
        const envPath = path.join(__dirname, '../config.env');
        let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

        if (envText.includes('MODE=')) {
            envText = envText.replace(/MODE=.*/g, `MODE=${mode}`);
        } else {
            envText += `\nMODE=${mode}`;
        }

        fs.writeFileSync(envPath, envText.trim());
        reply(`✅ Bot mode changed to *${mode.toUpperCase()}*`);
    } catch (e) {
        console.error(e);
        reply("❌ An error occurred while changing mode.");
    }
});
