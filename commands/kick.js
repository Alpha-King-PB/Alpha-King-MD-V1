const fs = require("fs");

module.exports = {
    name: "kick",
    aliases: ["remove"],
    description: "Remove a member from the group",
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
                    {
                        text: "❌ *ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ*\n\nᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ꜰᴏʀ ᴏᴡɴᴇʀs & ᴀᴅᴍɪɴs.",
                    },
                    { quoted: m },
                );
            }
            // ------------------------

            if (!m.key.remoteJid.endsWith("@g.us")) return;

            const msgContent =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                "";
            const args = msgContent.split(" ");
            let target;

            if (m.message.extendedTextMessage?.contextInfo?.participant) {
                target = m.message.extendedTextMessage.contextInfo.participant;
            } else if (
                m.message.extendedTextMessage?.contextInfo?.mentionedJid
                    ?.length > 0
            ) {
                target =
                    m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (args[1]) {
                target = args[1].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            }

            if (!target)
                return await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ ʀᴇᴘʟʏ, ᴍᴇɴᴛɪᴏɴ, ᴏʀ ᴛʏᴘᴇ ᴀ ɴᴜᴍʙᴇʀ." },
                    { quoted: m },
                );

            await conn.groupParticipantsUpdate(
                m.key.remoteJid,
                [target],
                "remove",
            );
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: `✅ sᴜᴄᴄᴇssꜰᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ @${target.split("@")[0]}`,
                    mentions: [target],
                },
                { quoted: m },
            );
        } catch (error) {
            console.log(error);
        }
    },
};
