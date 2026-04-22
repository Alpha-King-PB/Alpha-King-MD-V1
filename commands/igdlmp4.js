const axios = require("axios");

module.exports = {
    name: "igdlmp4",
    description: "Instagram Video/Reels Downloader",
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
                    { text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪɴsᴛᴀɢʀᴀᴍ ʟɪɴᴋ!" },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                { text: "🎬 ᴅᴏwnʟᴏᴀᴅɪɴɢ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ." },
                { quoted: m },
            );

            const apiUrl = `https://instagram.f-a-k.workers.dev/?url=${encodeURIComponent(userUrl)}`;
            const response = await axios.get(apiUrl);
            const resData = response.data;

            // Log එක අනුව නිවැරදි පාර: resData.urls[0]
            if (resData.success && resData.urls && resData.urls.length > 0) {
                const downloadUrl = resData.urls[0];

                const videoBuffer = await axios.get(downloadUrl, {
                    responseType: "arraybuffer",
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                    },
                });

                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        video: Buffer.from(videoBuffer.data),
                        caption: `✅ *Instagram Reels Downloaded*`,
                        mimetype: "video/mp4",
                    },
                    { quoted: m },
                );
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ. Pʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.",
                    },
                    { quoted: m },
                );
            }
        } catch (error) {
            console.error("[IG-LOG]: Error:", error.message);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ Sʏsᴛᴇᴍ ᴇʀʀᴏʀ. Pʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ. Bᴜᴛ ɪғ ɪᴛ ᴅᴏᴇsɴ'ᴛ ᴡᴏʀᴋ, ᴘʟᴇᴀsᴇ ᴄᴏɴᴛᴀᴄᴛ ᴛʜᴇ ᴏᴡɴᴇʀ.",
                },
                { quoted: m },
            );
        }
    },
};
