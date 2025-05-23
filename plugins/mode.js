const fs = require('fs');
const path = require('path');
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
        // Get the bot's own number dynamically
        const botNumberJid = conn.user?.id || conn.user?.jid; // Baileys user ID
        if (!botNumberJid) return reply("❌ Bot number not found. Try again later.");

        const botNumber = botNumberJid.split(':')[0].split('@')[0]; // Clean JID (handle device suffix)
        const senderNumber = sender.split('@')[0];

        // Only allow bot paired number to run
        if (senderNumber !== botNumber) {
            return reply("❌ This command is only for the bot paired number.");
        }

        // Parse mode argument
        const mode = (m.body.split(' ')[1] || '').toLowerCase();

        if (!['public', 'private'].includes(mode)) {
            return reply(`⚙️ *Current Mode:* ${global.config?.MODE?.toUpperCase() || 'UNKNOWN'}\n\n_Usage:_\n.mode public\n.mode private`);
        }

        // Update runtime config (global or your config module)
        if (global.config) {
            global.config.MODE = mode;
        }

        // Update config.env file
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
