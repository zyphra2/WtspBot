const axios = require('axios');

module.exports = {
    commands: ['ai', 'gpt', 'ask'],
    execute: async (sock, m, args, config) => {
        const text = args.join(" ");
        if (!text) return sock.sendMessage(m.key.remoteJid, { text: "How can I help you today? Please provide a prompt." });

        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: text }],
            }, {
                headers: { 'Authorization': `Bearer ${config.openaiKey}` }
            });

            const reply = response.data.choices[0].message.content;
            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ AI Service currently unavailable. Check your API key." });
        }
    }
};
