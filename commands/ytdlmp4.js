const axios = require("axios");

module.exports = {
    name: "ytdlmp4",
    aliases: ["mp4", "video"],
    description: "Download YouTube Video via Movanest API Final Fix",
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
                    { text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀොᴠɪᴅᴇ ᴀ ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ!" },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                { text: "⏳ ᴘʀොᴄᴇssɪɴɢ ʏᴏᴜʀ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ." },
                { quoted: m },
            );

            const apiUrl = `https://www.movanest.xyz/v2/ytmp4?url=${encodeURIComponent(userUrl)}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (res.status === true && res.result) {
                const qualityList = res.result.quality_list;

                // Screenshot එකට අනුව ලින්ක් එක තියෙන්නේ quality_list["720p"].url ඇතුළේ
                let videoUrl = "";

                if (qualityList["720p"] && qualityList["720p"].url) {
                    videoUrl = qualityList["720p"].url;
                } else if (qualityList["360p"] && qualityList["360p"].url) {
                    videoUrl = qualityList["360p"].url;
                } else {
                    videoUrl = res.result.download_url;
                }

                const title = res.result.title || "ᴀʟᴘʜᴀ-ᴋɪɴɢ-ᴠɪᴅᴇᴏ";

                if (!videoUrl || typeof videoUrl !== "string") {
                    return await conn.sendMessage(
                        m.key.remoteJid,
                        { text: "❌ ᴄᴏᴜʟᴅ ɴᴏᴛ ꜰɪɴᴅ ᴀ ᴠᴀʟɪᴅ ᴅᴏᴡɴʟᴏᴀᴅ ᴜʀʟ." },
                        { quoted: m },
                    );
                }

                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        video: { url: videoUrl },
                        caption: `🎬 *${title}*\n\n✅ sᴜᴄᴄᴇssꜰᴜʟʟʏ ᴅᴏᴡɴʟොᴀᴅᴇᴅ!`,
                        mimetype: "video/mp4",
                    },
                    { quoted: m },
                );
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    { text: `❌ API Error: ${res.message || "Unknown error"}` },
                    { quoted: m },
                );
            }
        } catch (error) {
            console.error("Movanest API Error:", error.message);
            await conn.sendMessage(
                m.key.remoteJid,
                { text: "❌ ꜰᴀɪʟᴇᴅ ᴛො ᴅᴏᴡɴʟᴏᴀᴅ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ." },
                { quoted: m },
            );
        }
    },
};
