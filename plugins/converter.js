const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

module.exports = {
    commands: ['s', 'sticker', 'wm'],
    execute: async (sock, m, args, config) => {
        const messageType = Object.keys(m.message)[0];
        const isImage = messageType === 'imageMessage' || (messageType === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage);

        if (!isImage) return sock.sendMessage(m.key.remoteJid, { text: "Please reply to an image with *.sticker*" });

        // Identify where the image is (direct or quoted)
        const quota = m.message.imageMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        const stream = await downloadContentFromMessage(quota, 'image');
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        const tempInput = `./temp_${Date.now()}.jpg`;
        const tempOutput = `./temp_${Date.now()}.webp`;

        fs.writeFileSync(tempInput, buffer);

        ffmpeg(tempInput)
            .outputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:(320-iw)/2:(320-ih)/2:color=00000000,setsar=1,variable_fps=1"])
            .save(tempOutput)
            .on('end', async () => {
                await sock.sendMessage(m.key.remoteJid, { sticker: fs.readFileSync(tempOutput) }, { quoted: m });
                fs.unlinkSync(tempInput);
                fs.unlinkSync(tempOutput);
            });
    }
};
