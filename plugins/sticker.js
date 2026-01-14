const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    commands: ['s', 'sticker', 'wm'],
    execute: async (sock, m, args, config) => {
        const messageType = Object.keys(m.message)[0];
        
        // Check if message is image or a quoted image
        const isImage = messageType === 'imageMessage' || 
                        (messageType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage);

        if (!isImage) return sock.sendMessage(m.key.remoteJid, { text: "📷 Please reply to an image with *.s*" });

        // Download Media
        const quota = m.message.imageMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        const stream = await downloadContentFromMessage(quota, 'image');
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { 
            buffer = Buffer.concat([buffer, chunk]); 
        }

        // Create Sticker with Metadata (The Marker)
        const sticker = new Sticker(buffer, {
            pack: "AyaTech Pack",        // The Pack Name
            author: "digitera.io 🇲🇦",    // The Author Name
            type: StickerTypes.FULL,     // Quality: FULL or CROPPED
            categories: ['🤩', '💻'],     // Emojis for the sticker
            id: 'aya-tech-bot',
            quality: 70,
        });

        const stickerBuffer = await sticker.toBuffer();
        
        await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });
    }
};
