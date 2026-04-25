const fs = require("fs");

module.exports = {
    name: "delete",
    aliases: ["del"],
    description: "Delete a message (Admin/Owner Only)",
    category: "admin",
    async execute(conn, m) {
        const settings = JSON.parse(fs.readFileSync("./settings.json"));
        try {
            // දත්ත Array එකක් බවට සහතික කර ගැනීම (Force to Array)
            const owners = Array.isArray(settings.ownerNumber)
                ? settings.ownerNumber
                : [settings.ownerNumber];
            const admins = Array.isArray(settings.adminNumbers)
                ? settings.adminNumbers
                : [settings.adminNumbers];
            const ownerId = settings.ownerId || "";
            const adminIds = Array.isArray(settings.adminIds)
                ? settings.adminIds
                : [settings.adminIds];

            const sender = m.sender;

            // පර්මිෂන් තියෙනවද කියලා බලනවා
            const isOwner =
                owners.some((num) => num && sender.includes(num)) ||
                sender === ownerId;
            const isAdmin =
                admins.some((num) => num && sender.includes(num)) ||
                adminIds.includes(sender);

            if (!isOwner && !isAdmin) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "🚫 Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ Oᴡɴᴇʀ ᴀɴᴅ Aᴅᴍɪɴs...",
                    },
                    { quoted: m },
                );
            }

            // 2. ඩිලීට් කරන්න ඕන මැසේජ් එක අඳුරගනිමු
            const quotedMessage =
                m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ Pʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴅᴇʟᴇᴛᴇ!",
                    },
                    { quoted: m },
                );
            }

            // මැසේජ් එකේ තොරතුරු (Key එක)
            const key = {
                remoteJid: m.key.remoteJid,
                fromMe: false,
                id: m.message.extendedTextMessage.contextInfo.stanzaId,
                participant:
                    m.message.extendedTextMessage.contextInfo.participant,
            };

            // 3. මැසේජ් එක ඩිලීට් කිරීම
            await conn.sendMessage(m.key.remoteJid, { delete: key });
            await conn.sendMessage(m.key.remoteJid, {
                react: { text: "🗑️", key: m.key },
            });
        } catch (error) {
            console.error("[DEL-LOG]:", error);
        }
    },
};
