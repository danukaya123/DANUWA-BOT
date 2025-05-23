const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "mode",
    desc: "Change bot mode to public or private",
    category: "owner",
    filename: __filename
},
async(conn, mek, m, {
    sender, reply
}) => {
    try {
        const ownerJid = config.BOT_OWNER + '@s.whatsapp.net';
        if (sender !== ownerJid) return reply("❌ This command is only for the bot owner.");

        const mode = m.body.split(' ')[1]?.toLowerCase();
        if (!['public', 'private'].includes(mode)) {
            return reply(`⚙️ *Current Mode:* ${config.MODE || 'public'}\n\n_Usage:_\n.mode public\n.mode private`);
        }

        // Update mode in memory
        config.MODE = mode;

        // Optional: update config.json if exists and writable
        try {
            const configPath = path.join(__dirname, '../config.json');
            if (fs.existsSync(configPath)) {
                const current = JSON.parse(fs.readFileSync(configPath));
                current.MODE = mode;
                fs.writeFileSync(configPath, JSON.stringify(current, null, 2));
            }
        } catch (err) {
            console.error("Failed to update config.json:", err);
        }

        reply(`✅ Bot mode changed to *${mode.toUpperCase()}*`);
    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});
