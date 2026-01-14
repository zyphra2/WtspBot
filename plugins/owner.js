// plugins/owner.js
module.exports = {
    commands: ['owner', 'developer', 'info'],
    execute: async (sock, m, args, config) => {
        const info = `
🌟 *Developer Profile: ${config.ownerName}*
🏢 *Brand:* ${config.brand}
📍 *Origin:* Morocco 🇲🇦
💻 *Niche:* Coding, Bots, Cybersecurity, AI

📫 *Contacts:*
• WhatsApp: wa.me/${config.ownerNumber[0]}
• Email: ${config.links.email}
• IG: @digitera.io

📢 *Channel:* ${config.links.whatsappChannel}
        `.trim();

        await sock.sendMessage(m.key.remoteJid, { text: info }, { quoted: m });
    }
};
