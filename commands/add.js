module.exports = {
    name: "add",
    description: "Add a member to the group",
    category: "group",
    async execute(conn, m) {
        try {
            // 1. Check if it is a group
            if (!m.key.remoteJid.endsWith("@g.us")) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.",
                    },
                    { quoted: m },
                );
            }

            // 2. Extract number from message
            const msgContent =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                "";
            const args = msgContent.split(" ");
            let number = args[1];

            if (!number) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ.\nᴇx: .ᴀᴅᴅ 94771234567",
                    },
                    { quoted: m },
                );
            }

            // 3. Format number to JID
            number = number.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            // 4. Update group participants
            const response = await conn.groupParticipantsUpdate(
                m.key.remoteJid,
                [number],
                "add",
            );

            // 5. Response handling with Bot Style
            if (response[0].status === "403") {
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ ᴄᴏᴜʟᴅ ɴᴏᴛ ᴀᴅᴅ: ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs ᴇɴᴀʙʟᴇᴅ.",
                    },
                    { quoted: m },
                );
            } else if (response[0].status === "200") {
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "✅ sᴜᴄᴄᴇssꜰᴜʟʟʏ ᴀᴅᴅᴇᴅ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ!",
                    },
                    { quoted: m },
                );
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴀᴅᴅ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪs ᴀɴ ᴀᴅᴍɪɴ.",
                    },
                    { quoted: m },
                );
            }
        } catch (error) {
            console.log("Add Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴀᴅᴅɪɴɢ.",
                },
                { quoted: m },
            );
        }
    },
};
