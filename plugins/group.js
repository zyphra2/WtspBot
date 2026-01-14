// plugins/group.js
module.exports = {
    commands: ['kick', 'add', 'promote', 'demote', 'hidetag', 'tagall', 'antilink'],
    execute: async (sock, m, args, config) => {
        const { remoteJid, participant } = m.key;
        const isGroup = remoteJid.endsWith('@g.us');
        
        if (!isGroup) return sock.sendMessage(remoteJid, { text: "❌ This command can only be used in groups." });

        // Metadata and Permissions check
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const participants = groupMetadata.participants;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const userIsAdmin = participants.find(p => p.id === participant)?.admin;
        const botIsAdmin = participants.find(p => p.id === botId)?.admin;

        if (!userIsAdmin) return sock.sendMessage(remoteJid, { text: "❌ You must be an Admin to use this." });
        if (!botIsAdmin) return sock.sendMessage(remoteJid, { text: "❌ Please make the Bot an Admin first." });

        const command = m.body.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase();
        const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quoted = m.message.extendedTextMessage?.contextInfo?.participant;
        const target = mentioned[0] || quoted || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        switch (command) {
            case 'kick':
                if (!target) return sock.sendMessage(remoteJid, { text: "❓ Tag or reply to a user to kick." });
                await sock.groupParticipantsUpdate(remoteJid, [target], "remove");
                break;

            case 'promote':
                if (!target) return sock.sendMessage(remoteJid, { text: "❓ Tag a user to promote." });
                await sock.groupParticipantsUpdate(remoteJid, [target], "promote");
                await sock.sendMessage(remoteJid, { text: `✅ User promoted to Admin.` });
                break;

            case 'demote':
                if (!target) return sock.sendMessage(remoteJid, { text: "❓ Tag a user to demote." });
                await sock.groupParticipantsUpdate(remoteJid, [target], "demote");
                await sock.sendMessage(remoteJid, { text: `✅ User demoted.` });
                break;

            case 'tagall':
            case 'hidetag':
                const message = args.join(" ") || "Attention everyone!";
                const members = participants.map(u => u.id);
                await sock.sendMessage(remoteJid, { 
                    text: `📢 *${message}*`, 
                    mentions: members 
                });
                break;

            case 'antilink':
                // Note: Real antilink requires a database (JSON or MongoDB) to save group settings.
                // This is a toggle logic placeholder.
                await sock.sendMessage(remoteJid, { text: "⚙️ Antilink feature is being configured for this group..." });
                break;
        }
    }
};
