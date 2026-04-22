const axios = require("axios");

module.exports = {
    name: "ttdlmp4",
    description: "TikTok Video Downloader",
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
                    { text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!" },
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

            // TikWM API Call
            const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(userUrl)}`;

            const response = await axios.get(apiUrl);

            if (response.data && response.data.code === 0) {
                const resData = response.data.data;
                // ලොග් එක බලලා මෙතන Path එක වෙනස් කරන්න වෙයි
                const downloadUrl =
                    resData.play || resData.hdplay || resData.wmplay;
                const title = resData.title || "TikTok Video";

                if (downloadUrl) {
                    const videoBuffer = await axios.get(downloadUrl, {
                        responseType: "arraybuffer",
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                        },
                    });

                    await conn.sendMessage(
                        m.key.remoteJid,
                        {
                            video: Buffer.from(videoBuffer.data),
                            caption: `✅ *TikTok Video Downloaded*\n\n*Title:* ${title}`,
                            mimetype: "video/mp4",
                        },
                        { quoted: m },
                    );
                } else {
                    throw new Error("No download URL found");
                }
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: `❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ. Pʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.`,
                    },
                    { quoted: m },
                );
            }
        } catch (error) {
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
