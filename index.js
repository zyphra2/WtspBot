// index.js
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const config = require('./config');

async function startAyaTech() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const messageType = Object.keys(m.message)[0];
            const body = (messageType === 'conversation') ? m.message.conversation : 
                         (messageType === 'extendedTextMessage') ? m.message.extendedTextMessage.text : '';

            if (!body.startsWith(config.prefix)) return;

            const args = body.slice(config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            // Modular Command Handler
            const pluginFolder = path.join(__dirname, 'plugins');
            const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

            for (const file of pluginFiles) {
                const plugin = require(path.join(pluginFolder, file));
                if (plugin.commands.includes(command)) {
                    await plugin.execute(sock, m, args, config);
                }
            }
        } catch (err) {
            console.error("Error handling message:", err);
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAyaTech();
        } else if (connection === 'open') {
            console.log('AyaTech is online! 🚀');
        }
    });
}

startAyaTech();
