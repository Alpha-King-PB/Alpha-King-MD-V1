module.exports = {
    name: "save",
    aliases: ["get", "keep"],
    description: "Save a message to your inbox",
    category: "tools",
    async execute(conn, m) {
        try {
            // 1. රිප්ලයි එකක් තියෙනවාදැයි පරීක්ෂා කිරීම
            if (!m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ sᴀᴠᴇ.",
                    },
                    { quoted: m },
                );
            }

            // 2. රිප්ලයි කරපු මැසේජ් එක ලබා ගැනීම
            const quotedMsg =
                m.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedParticipant =
                m.message.extendedTextMessage.contextInfo.participant;
            const quotedId = m.message.extendedTextMessage.contextInfo.stanzaId;

            // 3. Forward කිරීමට අවශ්‍ය structure එක සකස් කිරීම
            // අපි බොට්ගේ inbox එකට (conn.user.id) මේක යවනවා
            await conn.sendMessage(
                conn.user.id.split(":")[0] + "@s.whatsapp.net",
                {
                    forward: {
                        key: {
                            remoteJid: m.key.remoteJid,
                            fromMe: false,
                            id: quotedId,
                            participant: quotedParticipant,
                        },
                        message: quotedMsg,
                    },
                },
            );

            // 4. සාර්ථක බව දැනුම් දීම
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "✅ ᴍᴇssᴀɢᴇ sᴀᴠᴇᴅ ᴛᴏ ʏᴏᴜʀ ɪɴʙᴏx!",
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("Save Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ꜰᴀɪʟᴇᴅ ᴛᴏ sᴀᴠᴇ ᴛʜᴇ ᴍᴇssᴀɢᴇ.",
                },
                { quoted: m },
            );
        }
    },
};
