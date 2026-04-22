const axios = require("axios");

module.exports = {
    name: "fbdlmp4",
    description: "Facebook Video Downloader",
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
                    { text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ʟɪɴᴋ!" },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "🎬 Dᴏᴡɴʟᴏᴀᴅɪɴɢ ᴛʜᴇ ғᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ... Pʟᴇᴀsᴇ ᴡᴀɪᴛ.",
                },
                { quoted: m },
            );

            const apiUrl = `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(userUrl)}`;
            const response = await axios.get(apiUrl);
            const resData = response.data;

            // Log එක අනුව නිවැරදි Path එක මෙන්න මේකයි:
            if (resData.status && resData.data && resData.data.downloads) {
                const downloads = resData.data.downloads;

                // මුලින්ම 720p බලනවා, නැත්නම් පළවෙනි එක ගන්නවා
                const videoData =
                    downloads.find((v) => v.quality.includes("720p")) ||
                    downloads[0];
                const downloadUrl = videoData.url;

                if (downloadUrl) {
                    const videoBuffer = await axios.get(downloadUrl, {
                        responseType: "arraybuffer",
                    });

                    await conn.sendMessage(
                        m.key.remoteJid,
                        {
                            video: Buffer.from(videoBuffer.data),
                            caption: `✅ *Facebook Video*\n\n*Title:* ${resData.data.title || "FB Video"}\n*Duration:* ${resData.data.duration || "N/A"}`,
                            mimetype: "video/mp4",
                        },
                        { quoted: m },
                    );
                } else {
                    throw new Error("Download URL not found");
                }
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
            console.error("[FB-LOG]: Error:", error.message);
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
