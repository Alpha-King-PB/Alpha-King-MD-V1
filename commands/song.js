const yts = require("yt-search");
const axios = require("axios");

module.exports = {
    name: "song",
    description: "Search songs from YouTube",
    category: "Search",
    async execute(conn, m) {
        try {
            const text =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                m.message.videoMessage?.caption ||
                "";

            const args = text.trim().split(/ +/).slice(1);
            const query = args.join(" ");

            if (!query) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sᴏɴɢ ɴᴀᴍᴇ!" },
                    { quoted: m },
                );
            }

            await conn.sendMessage(
                m.key.remoteJid,
                { text: `🔍 sᴇᴀʀᴄʜɪɴɢ ꜰᴏʀ: *${query}*...` },
                { quoted: m },
            );

            const search = await yts(query);
            if (!search || !search.videos || search.videos.length === 0) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ ɴᴏ ʀᴇsᴜʟᴛs ꜰᴏᴜɴᴅ." },
                    { quoted: m },
                );
            }

            const videos = search.videos.slice(0, 10);

            // Thumbnail එක Buffer එකක් ලෙස ගැනීම (අනිවාර්යයෙන්ම)
            let thumbnailBuffer = null;
            try {
                const response = await axios.get(videos[0].thumbnail, {
                    responseType: "arraybuffer",
                });
                thumbnailBuffer = Buffer.from(response.data, "binary");
            } catch (e) {
                console.log("Thumbnail error:", e.message);
            }

            let responseText = `╭──『 *ʏᴏᴜᴛᴜʙᴇ sᴇᴀʀᴄʜ* 』──⊷\n`;
            videos.forEach((vid, index) => {
                responseText += `*${index + 1}. ${vid.title.toUpperCase()}*\n\n`;
                responseText += `⌚ ${vid.timestamp} | 👁️ ${vid.views.toLocaleString()}\n`;
                responseText += `🔗 ${vid.url}\n\n`;
                responseText += `──────────────────⊷\n\n`;
            });

            // --- මෙන්න මෙතනයි වෙනස ---
            const messageOptions = {
                text: responseText,
                contextInfo: {
                    externalAdReply: {
                        title: "ᴀʟᴘʜᴀ ᴋɪɴɢ sᴏɴɢ sᴇᴀʀᴄʜ",
                        body: `ʀᴇsᴜʟᴛs ꜰᴏʀ ${query}`,
                        thumbnail: thumbnailBuffer, // Buffer එක පමණක් පාවිච්චි කරයි
                        sourceUrl: videos[0].url,
                        mediaType: 1,
                        // අමතර properties ඔක්කොම අයින් කළා
                    },
                },
            };

            await conn.sendMessage(m.key.remoteJid, messageOptions, {
                quoted: m,
            });
            console.log(`[SONG SEARCH] Success!`);
        } catch (error) {
            console.error("[SONG ERROR]:", error);
            // Error එකක් වුණොත් Thumbnail නැතුව යවන්න උත්සාහ කරයි
            await conn.sendMessage(
                m.key.remoteJid,
                { text: "❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ." },
                { quoted: m },
            );
        }
    },
};
