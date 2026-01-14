const ytdl = require('ytdl-core');
const tiktokdl = require('@faouzkk/tiktok-dl');
const fs = require('fs');

module.exports = {
    commands: ['ytmp4', 'ytmp3', 'tt', 'tiktok'],
    execute: async (sock, m, args, config) => {
        const command = m.body.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase();
        const url = args[0];

        if (!url) return sock.sendMessage(m.key.remoteJid, { text: `❌ Please provide a link! Example: ${config.prefix}${command} [url]` });

        try {
            // --- TIKTOK LOGIC ---
            if (command === 'tt' || command === 'tiktok') {
                await sock.sendMessage(m.key.remoteJid, { text: "⏳ Fetching TikTok video (No Watermark)..." });
                const data = await tiktokdl(url);
                if (data.video) {
                    await sock.sendMessage(m.key.remoteJid, { 
                        video: { url: data.video }, 
                        caption: `✅ TikTok Downloaded\n\n${config.footer}` 
                    }, { quoted: m });
                }
            }

            // --- YOUTUBE LOGIC ---
            if (command === 'ytmp4' || command === 'ytmp3') {
                await sock.sendMessage(m.key.remoteJid, { text: "⏳ Processing YouTube link..." });
                const info = await ytdl.getInfo(url);
                
                if (command === 'ytmp4') {
                    // Download Video
                    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
                    await sock.sendMessage(m.key.remoteJid, { 
                        video: { url: format.url }, 
                        caption: `🎬 *Title:* ${info.videoDetails.title}\n\n${config.footer}` 
                    }, { quoted: m });
                } else {
                    // Download Audio (MP3)
                    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
                    await sock.sendMessage(m.key.remoteJid, { 
                        audio: { url: format.url }, 
                        mimetype: 'audio/mp4',
                        ptt: false 
                    }, { quoted: m });
                }
            }
        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error: Could not process the link. It might be private or invalid." });
        }
    }
};
