const axios = require("axios");
require("dotenv").config();

module.exports = {
    name: "ytdlmp3",
    aliases: ["mp3", "downloadmp3"],
    description: "Download YouTube video as MP3",
    category: "download",
    async execute(conn, m) {
        try {
            const text =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                "";

            const args = text.trim().split(/ +/).slice(1);
            let url = args[0];

            if (!url) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ!",
                    },
                    { quoted: m },
                );
            }

            // YouTube ලින්ක් එකක්දැයි පරීක්ෂාව
            if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ ɪɴᴠᴀʟɪᴅ ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ.",
                    },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                { text: "⏳ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ʏᴏᴜʀ ᴍᴘ3... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ." },
                { quoted: m },
            );

            const baseApiUrl =
                "https://api.fastdevelopers.in/ytmp3?url=https://youtu.be/l-JY3lGg_Ik";

            // ලින්ක් එක Encode කිරීම (විශේෂ අකුරු/සලකුණු නිසා වෙන එරර් නැති කිරීමට)
            const encodedUrl = encodeURIComponent(url);
            const fullUrl = `${baseApiUrl}?url=${encodedUrl}`;

            const response = await axios.get(fullUrl);

            // FastDevelopers API එකේ data structure එකට අනුව ගැනීම
            const downloadLink =
                response.data.result ||
                response.data.url ||
                response.data.download_url ||
                response.data.link;
            const title = response.data.title || "ᴀʟᴘʜᴀ-ᴋɪɴɢ-ᴍᴜsɪᴄ";

            if (!downloadLink) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ ᴀᴘɪ ʀᴇᴛᴜʀɴᴇᴅ ɴᴏ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ. ᴛʜᴇ ᴠɪᴅᴇᴏ ᴍɪɢʜᴛ ʙᴇ ᴛᴏᴏ ʟᴏɴɢ ᴏʀ ʀᴇsᴛʀɪᴄᴛᴇᴅ.",
                    },
                    { quoted: m },
                );
            }

            // MP3 එක Audio එකක් විදිහට යැවීම
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    audio: { url: downloadLink },
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`,
                },
                { quoted: m },
            );
        } catch (error) {
            console.error("YTDL MP3 Error:", error.message);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ᴇʀʀᴏʀ: ᴄᴏᴜʟᴅ ɴᴏᴛ ᴘʀᴏᴄᴇss ᴛʜɪs ʟɪɴᴋ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɴᴏᴛʜᴇʀ.",
                },
                { quoted: m },
            );
        }
    },
};
