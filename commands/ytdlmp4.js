const axios = require("axios");

module.exports = {
    name: "ytdlmp4",
    description: "YouTube To Mp4 Downloader",
    category: "download",
    async execute(conn, m) {
        try {
            const text =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                "";
            const args = text.trim().split(/ +/).slice(1);
            let userUrl = args[0];

            if (!userUrl) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ!" },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "🎬 ᴅᴏwnʟᴏᴀᴅɪɴɢ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ.",
                },
                { quoted: m },
            );

            let downloadUrl = "";
            let title = "ᴀʟᴘʜᴀ-ᴋɪɴɢ-ᴠɪᴅᴇᴏ";

            // --- API Call ---
            try {
                const res = await axios.get(
                    `https://www.movanest.xyz/v2/ytmp4?url=${encodeURIComponent(userUrl)}`,
                );
                if (res.data.status === true && res.data.result) {
                    title = res.data.result.title || title;
                    const qList = res.data.result.quality_list;
                    // 360p එක ගොඩක් වෙලාවට සාර්ථකයි WhatsApp වලට
                    downloadUrl =
                        qList["360p"]?.url ||
                        qList["720p"]?.url ||
                        qList["480p"]?.url;
                }
            } catch (e) {
                console.log("API Fetch Error");
            }

            if (downloadUrl) {
                // වීඩියෝ එක Buffer එකක් විදියට ගන්නවා (මේකෙන් තමයි අර File Error එක නැති වෙන්නේ)
                const videoBuffer = await axios.get(downloadUrl, {
                    responseType: "arraybuffer",
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    },
                });

                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        video: Buffer.from(videoBuffer.data),
                        caption: `✅ *${title}*\nsᴜᴄᴄᴇssꜰᴜʟʟʏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ!`,
                        mimetype: "video/mp4",
                    },
                    { quoted: m },
                );
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ. Pʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ." },
                    { quoted: m },
                );
            }
        } catch (error) {
            console.error(error);
            await conn.sendMessage(
                m.key.remoteJid,
                { text: "❌ sʏsᴛᴇᴍ ᴇʀʀᴏʀ. Tʜᴇ ᴠɪᴅᴇᴏ ᴍᴀʏ ʙᴇ ᴛᴏᴏ ʟᴀʀɢᴇ." },
                { quoted: m },
            );
        }
    },
};
