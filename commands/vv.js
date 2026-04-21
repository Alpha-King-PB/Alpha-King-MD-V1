const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "vv",
    aliases: ["viewonce"],
    description: "Download View Once media",
    category: "tools",
    async execute(conn, m) {
        try {
            // 1. Reply කරපු මැසේජ් එකේ structure එක පරීක්ෂා කිරීම
            const quoted =
                m.message.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇᴅɪᴀ.",
                    },
                    { quoted: m },
                );
            }

            // View Once එක සොයාගැනීම (V2 හෝ V2Extension ඇතුළේ තිබිය හැක)
            let viewOnce =
                quoted.viewOnceMessageV2 ||
                quoted.viewOnceMessageV2Extension ||
                quoted.ephemeralMessage?.message?.viewOnceMessageV2;

            // සමහර වෙලාවට කෙලින්ම quoted එක ඇතුළේ Image/Video එක තිබිය හැක
            let mediaMessage =
                viewOnce?.message?.imageMessage ||
                viewOnce?.message?.videoMessage ||
                quoted.imageMessage ||
                quoted.videoMessage;

            // පරීක්ෂා කිරීම: මේක ඇත්තටම View Once එකක්ද?
            if (
                !viewOnce &&
                !quoted.imageMessage?.viewOnce &&
                !quoted.videoMessage?.viewOnce
            ) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴛʜɪs ɪs ɴᴏᴛ ᴀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇᴅɪᴀ.",
                    },
                    { quoted: m },
                );
            }

            const type =
                mediaMessage ===
                (viewOnce?.message?.imageMessage || quoted.imageMessage)
                    ? "image"
                    : "video";

            await conn.sendMessage(
                m.key.remoteJid,
                { text: "⏳ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇᴅɪᴀ..." },
                { quoted: m },
            );

            // 2. Download Media
            const stream = await downloadContentFromMessage(mediaMessage, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const caption =
                mediaMessage.caption || "✅ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇᴅɪᴀ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ";

            // 3. යැවීම
            if (type === "image") {
                await conn.sendMessage(
                    m.key.remoteJid,
                    { image: buffer, caption: caption },
                    { quoted: m },
                );
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    { video: buffer, caption: caption, mimetype: "video/mp4" },
                    { quoted: m },
                );
            }
        } catch (error) {
            console.log("VV Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ. ɪᴛ ᴍɪɢʜᴛ ʙᴇ ᴇxᴘɪʀᴇᴅ.",
                },
                { quoted: m },
            );
        }
    },
};
