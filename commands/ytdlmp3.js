const axios = require("axios");

module.exports = {
    name: "ytdlmp3",
    description: "YouTube To Mp3 Downloader",
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
                { text: "🎶 ᴅᴏwnʟᴏᴀᴅɪɴɢ ᴀᴜᴅɪᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ." },
                { quoted: m },
            );

            let downloadUrl = "";
            let title = "ᴀʟᴘʜᴀ-ᴋɪɴɢ-ᴍᴘ3";

            // --- API 1: FastDevelopers (Log එක අනුව Fix කළා) ---
            try {
                const res1 = await axios.get(
                    `https://api.fastdevelopers.in/ytmp3?url=${userUrl}`,
                );
                if (res1.data.status === true) {
                    // Log එකේ තියෙන විදිහට මේකේ result එකක් නැහැ, කෙලින්ම download_url තියෙන්නේ
                    downloadUrl = res1.data.download_url;
                }
            } catch (e) {
                console.log("API 1 Failed");
            }

            // --- API 2: Movanest (Log එක අනුව Fix කළා) ---
            if (!downloadUrl) {
                try {
                    const res2 = await axios.get(
                        `https://www.movanest.xyz/v2/ytmp3?url=${userUrl}`,
                    );
                    if (res2.data.status === true && res2.data.result) {
                        // Log එකේ තියෙන්නේ downloadUrl (U capital), download_url නෙවෙයි
                        downloadUrl =
                            res2.data.result.downloadUrl ||
                            res2.data.result.url;
                        title = res2.data.result.title || title;
                    }
                } catch (e) {
                    console.log("API 2 Failed");
                }
            }

            if (downloadUrl) {
                // සින්දුව යැවීම
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        audio: { url: downloadUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${title}.mp3`,
                    },
                    { quoted: m },
                );

                await conn.sendMessage(
                    m.key.remoteJid,
                    { text: `✅ *${title}*\nsᴜᴄᴄᴇssꜰᴜʟʟʏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ!` },
                    { quoted: m },
                );
            } else {
                await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ ᴅොවුන්ලෝඩ් එක අසාර්ථකයි. API දෙකම වැඩ නැහැ." },
                    { quoted: m },
                );
            }
        } catch (error) {
            await conn.sendMessage(
                m.key.remoteJid,
                { text: "❌ sʏsᴛᴇᴍ ᴇʀʀᴏʀ. ᴛʀʏ ᴀɢᴀɪɴ." },
                { quoted: m },
            );
        }
    },
};
