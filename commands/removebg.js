const axios = require("axios");
const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "removebg",
    aliases: ["rbg"],
    description: "Remove image background",
    category: "tools",
    async execute(conn, m) {
        try {
            // 1. settings.json එකෙන් prefix එක ගැනීම
            const settings = JSON.parse(
                fs.readFileSync("./settings.json", "utf8"),
            );
            const prefix = settings.prefix || ".";
            const botName = settings.botName || "Alpha King Bot";

            // 2. පින්තූරය තෝරාගැනීම (Direct image or replied image)
            const quoted =
                m.msg?.contextInfo?.quotedMessage ||
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = m.message?.imageMessage || quoted?.imageMessage;

            if (!isImage) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: `⚠️ Pʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴘɪᴄᴛᴜʀᴇ ᴡɪᴛʜ${prefix}rbg/${prefix}removebg ᴏʀ\nᴜsᴇ ${prefix}rbg/${prefix}removebg ᴀs ᴄᴀᴘᴛɪᴏɴ.`,
                    },
                    { quoted: m },
                );
            }

            const messageToDownload = m.message?.imageMessage
                ? m.message.imageMessage
                : quoted?.imageMessage;

            // හිතනවා කියලා පෙන්වන්න reaction එකක්
            await conn.sendMessage(m.key.remoteJid, {
                react: { text: "⏳", key: m.key },
            });

            // 3. පින්තූරය ඩවුන්ලෝඩ් කිරීම
            const stream = await downloadContentFromMessage(
                messageToDownload,
                "image",
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Remove.bg API එකට යැවීම (ඔයා දීපු API Key එක මෙතන තියෙනවා)
            const response = await axios.post(
                "https://api.remove.bg/v1.0/removebg",
                {
                    image_file_b64: buffer.toString("base64"),
                    size: "auto",
                },
                {
                    headers: {
                        "X-Api-Key": "atxcGa9uxbSVkEU54VR9SwGP", // ඔයාගේ API Key එක
                    },
                    responseType: "arraybuffer",
                },
            );

            // 5. ප්‍රතිඵලය යැවීම
            if (response.data) {
                await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        image: Buffer.from(response.data),
                        caption: `✅ Bᴀᴄᴋɢʀᴏᴜɴᴅ Rᴇᴍᴏᴠᴇᴅ Sᴜᴄᴄᴇssғᴜʟʟʏ!\n\n*${botName} 𝑩𝒂𝒄𝒌𝒈𝒓𝒐𝒖𝒏𝒅 𝑹𝒆𝒎𝒐𝒗𝒆𝒓*`,
                    },
                    { quoted: m },
                );
                await conn.sendMessage(m.key.remoteJid, {
                    react: { text: "✅", key: m.key },
                });
            }
        } catch (error) {
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: `❌ Bᴀᴄᴋɢʀᴏᴜɴᴅ Rᴇᴍᴏᴠᴇʀ ғᴀɪʟᴇᴅ. Pʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.`,
                },
                { quoted: m },
            );
        }
    },
};
