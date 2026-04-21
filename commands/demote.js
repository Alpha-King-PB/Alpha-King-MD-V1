const fs = require("fs");

module.exports = {
    name: "demote",
    description: "Demote from admin",
    category: "group",
    async execute(conn, m) {
        try {
            const settings = JSON.parse(fs.readFileSync("./settings.json"));
            const sender = m.sender;
            const senderNumber = sender.split("@")[0].split(":")[0];

            // --- Pᴇʀᴍɪssɪᴏɴ Cʜᴇᴄᴋ ---
            const isOwner =
                settings.ownerNumber.includes(senderNumber) ||
                settings.ownerId.includes(sender);
            const isAdmin =
                settings.adminNumbers.includes(senderNumber) ||
                settings.adminIds.includes(sender);

            if (!isOwner && !isAdmin) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ *ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ*" },
                    { quoted: m },
                );
            }

            if (!m.key.remoteJid.endsWith("@g.us")) return;

            let target =
                m.message.extendedTextMessage?.contextInfo?.participant ||
                m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                (
                    m.message.conversation ||
                    m.message.extendedTextMessage?.text ||
                    ""
                )
                    .split(" ")[1]
                    ?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            if (!target || target.length < 10)
                return await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ ɪɴᴠᴀʟɪᴅ ᴜsᴇʀ." },
                    { quoted: m },
                );

            await conn.groupParticipantsUpdate(
                m.key.remoteJid,
                [target],
                "demote",
            );
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: `✅ @${target.split("@")[0]} ᴅᴇᴍᴏᴛᴇᴅ sᴜᴄᴄᴇssꜰᴜʟʟʏ!`,
                    mentions: [target],
                },
                { quoted: m },
            );
        } catch (error) {
            console.log(error);
        }
    },
};
