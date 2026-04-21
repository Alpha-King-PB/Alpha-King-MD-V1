module.exports = {
    name: "getid",
    aliases: ["jid", "id"],
    description: "Get JID of a user or group",
    category: "tools",
    async execute(conn, m) {
        try {
            let targetJid;

            // 1. Reply කර ඇති විට එම පුද්ගලයාගේ ID එක ගැනීම
            if (m.message.extendedTextMessage?.contextInfo?.participant) {
                targetJid =
                    m.message.extendedTextMessage.contextInfo.participant;
            }
            // 2. Mention කර ඇති විට එම පුද්ගලයාගේ ID එක ගැනීම
            else if (
                m.message.extendedTextMessage?.contextInfo?.mentionedJid
                    ?.length > 0
            ) {
                targetJid =
                    m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            // 3. කිසිවක් නැති විට එම චැට් එකේ (Group/Private) ID එක ගැනීම
            else {
                targetJid = m.key.remoteJid;
            }

            // ID එක පණිවිඩයක් ලෙස යැවීම
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: `📍 *ᴊɪᴅ:* ${targetJid}`,
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("GetID Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴛʀɪᴇᴠᴇ ᴊɪᴅ.",
                },
                { quoted: m },
            );
        }
    },
};
