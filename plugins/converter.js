const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    commands: ['steal', 'wm', 'take'],
    execute: async (sock, m, args, config) => {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Check if the quoted message is a sticker
        if (!quoted || !quoted.stickerMessage) {
            return sock.sendMessage(m.key.remoteJid, { text: "🏷️ Please reply to a sticker with *.steal* to rebrand it." });
        }

        // Custom names from arguments or defaults from config
        const packName = args[0] || "AyaTech Pack";
        const authorName = args[1] || "digitera.io 🇲🇦";

        await sock.sendMessage(m.key.remoteJid, { text: "🪄 Rebranding sticker..." });

        try {
            // Download the existing sticker
            const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Re-create sticker with NEW metadata
            const sticker = new Sticker(buffer, {
                pack: packName,
                author: authorName,
                type: StickerTypes.FULL,
                quality: 70,
            });

            const stickerBuffer = await sticker.toBuffer();
            await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to steal sticker." });
        }
    }
};
