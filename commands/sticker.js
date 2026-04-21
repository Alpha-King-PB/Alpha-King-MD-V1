const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "sticker",
    aliases: ["s"],
    description: "Convert image/video to sticker",
    category: "convert",
    async execute(conn, m) {
        try {
            // 1. Media එක අඳුනා ගැනීම (Direct or Quoted)
            const quoted =
                m.message.extendedTextMessage?.contextInfo?.quotedMessage ||
                m.message;

            let type;
            let mediaMessage;

            if (quoted.imageMessage) {
                type = "image";
                mediaMessage = quoted.imageMessage;
            } else if (quoted.videoMessage) {
                type = "video";
                mediaMessage = quoted.videoMessage;
            } else if (quoted.viewOnceMessageV2?.message?.imageMessage) {
                type = "image";
                mediaMessage = quoted.viewOnceMessageV2.message.imageMessage;
            } else if (quoted.viewOnceMessageV2?.message?.videoMessage) {
                type = "video";
                mediaMessage = quoted.viewOnceMessageV2.message.videoMessage;
            }

            if (!type) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ ᴠɪᴅᴇᴏ ᴡɪᴛʜ .sᴛɪᴄᴋᴇʀ",
                    },
                    { quoted: m },
                );
            }

            // 2. වීඩියෝ එක තත්පර 10කට වඩා වැඩි දැයි පරීක්ෂා කිරීම
            if (type === "video" && mediaMessage.seconds > 10) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ ᴠɪᴅᴇᴏ ɪs ᴛᴏᴏ ʟᴏɴɢ! ᴍᴀxɪᴍᴜᴍ ʟɪᴍɪᴛ ɪs 10 sᴇᴄᴏɴᴅs.",
                    },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                { text: "⏳ ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ sᴛɪᴄᴋᴇʀ..." },
                { quoted: m },
            );

            // 3. Media Buffer එක Download කිරීම
            const stream = await downloadContentFromMessage(mediaMessage, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Sticker එක නිර්මාණය කිරීම (Optimized for Video)
            const sticker = new Sticker(buffer, {
                pack: "ᴀʟᴘʜᴀ ᴋɪɴɢ ʙᴏᴛ",
                author: "ᴍᴀsᴛᴇʀ",
                type: StickerTypes.FULL,
                quality: type === "video" ? 30 : 70, // වීඩියෝ නම් quality එක ගොඩක් අඩු කරයි
                fps: 8, // Frames per second
            });

            const stickerBuffer = await sticker.toBuffer();

            // 5. ස්ටිකර් එක යැවීම
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    sticker: stickerBuffer,
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("Sticker Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄᴏɴᴠᴇʀᴛ sᴛɪᴄᴋᴇʀ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ꜰɪʟᴇ ɪs sᴍᴀʟʟ.",
                },
                { quoted: m },
            );
        }
    },
};
