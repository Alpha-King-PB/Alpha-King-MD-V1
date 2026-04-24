const fs = require("fs");

module.exports = {
    name: "lv",
    aliases: ["love"],
    description: "Calculate love percentage between two names",
    category: "fun",
    async execute(conn, m) {
        try {
            const settings = JSON.parse(fs.readFileSync("./settings.json"));
            const prefix = settings.prefix;

            const text =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                "";
            // කමාන්ඩ් එක අයින් කරලා ඉතුරු ටික ගන්නවා
            const args = text.trim().split(/ +/).slice(1).join(" ");

            // 1. පාවිච්චි කරන්න බැරි නම් (Blacklist)
            const blockedNames = [
                "Sayuru",
                "sayuru",
                "SAYURU",
                "Anuhas",
                "anuhas",
                "ANUHAS",
                "Munasinghe",
                "munasinghe",
                "MUNASINGHE",
                "සයුරු",
                "අනුහස්",
                "මුනසිංහ",
                "මුණසිංහ",
            ]; // ඔයාට ඕන නම් මෙතනට දාන්න

            if (!args || !args.includes("+")) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: `⚠️ Pʟᴇᴀsᴇ ɢɪᴠᴇ ᴛᴡᴏ ɴᴀᴍᴇs!\n\n*Hᴏᴡ ᴛᴏ ᴜsᴇ:*\n\n${prefix}lv <name 1> + <name 2>`,
                    },
                    { quoted: m },
                );
            }

            // නම් දෙක වෙන් කරගැනීම
            const names = args.split("+").map((n) => n.trim());
            const name1 = names[0];
            const name2 = names[1];

            // 2. බ්ලොක් ලිස්ට් එක චෙක් කිරීම
            const isBlocked = blockedNames.some(
                (b) => name1.includes(b) || name2.includes(b),
            );
            if (isBlocked) {
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: `🚫 Tʜᴏsᴇ ᴛʜɪɴɢs ᴀʀᴇ ɴᴏᴛ ʏᴏᴜʀs. Dᴏɴ'ᴛ ʟᴏᴏᴋ ғᴏʀ ᴏᴛʜᴇʀ ᴘᴇᴏᴘʟᴇ's ᴛʜɪɴɢs, ʟᴏᴏᴋ ғᴏʀ ʏᴏᴜʀsᴇʟғ.\n\nBᴇғᴏʀᴇ ʏᴏᴜ ʀᴇᴍᴏᴠᴇ ᴛʜᴇ sᴘᴇᴄᴋ ғʀᴏᴍ sᴏᴍᴇᴏɴᴇ ᴇʟsᴇ's ᴇʏᴇ, ʀᴇᴍᴏᴠᴇ ᴛʜᴇ ᴘʟᴀɴᴋ ғʀᴏᴍ ʏᴏᴜʀ ᴏᴡɴ ᴇʏᴇ.`,
                    },
                    { quoted: m },
                );
            }

            // 3. ප්‍රතිශතය ගණනය කිරීම
            // නම් දෙක හැමදාම එකම නම්, ප්‍රතිශතයත් එකම වෙන්න නම් අපි පොඩි trick එකක් දාමු
            const combinedString = (name1 + name2)
                .toLowerCase()
                .split("")
                .sort()
                .join("");
            let hash = 0;
            for (let i = 0; i < combinedString.length; i++) {
                hash = combinedString.charCodeAt(i) + ((hash << 5) - hash);
            }
            const lovePercentage = Math.abs(hash % 101);

            // 4. Progress Bar එක
            const heartCount = Math.floor(lovePercentage / 10);
            const progressBar =
                "❤️".repeat(heartCount) + "🖤".repeat(10 - heartCount);

            const responseText = `
*╭───「 ❤️ LOVE CALC 」───╮*

*👩‍❤️‍👨 Names:* ${name1}  *+* ${name2}

*📊 Percentage:* ${lovePercentage}%
*${progressBar}*

*✨ Result:* ${lovePercentage > 80 ? "A ᴘᴇʀғᴇᴄᴛ ʟᴏᴠᴇ! 💘" : lovePercentage > 50 ? "A ɢᴏᴏᴅ ᴍᴀᴛᴄʜ! 💞" : "Yᴏᴜ ʜᴀᴠᴇ ᴛᴏ ᴛʜɪɴᴋ ᴀ ʟɪᴛᴛʟᴇ. 💔"}

*╰────────────────────╯*
            `.trim();

            await conn.sendMessage(
                m.key.remoteJid,
                { text: responseText },
                { quoted: m },
            );
        } catch (error) {
            console.error("[LOVE-LOG]:", error);
        }
    },
};
