const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    description: "Dynamic Category Menu",
    category: "main",
    async execute(conn, m) {
        try {
            const settings = JSON.parse(fs.readFileSync("./settings.json"));
            const botName = settings.botName;
            const botLogo = settings.logoUrl;
            const developerName = settings.developerName;

            // 1. ලංකාවේ වෙලාව නිවැරදිව ලබා ගැනීම
            const srilankaTime = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Colombo",
            });
            const time = new Date(srilankaTime).toLocaleTimeString();
            const date = new Date(srilankaTime).toLocaleDateString();

            // 2. Sender ව නිවැරදිව හඳුනාගැනීම (Fix for split error)
            const sender = m.key.fromMe
                ? conn.user.id
                : m.key.participant || m.key.remoteJid || "";
            const senderNumber = sender
                ? sender.split("@")[0].split(":")[0]
                : "User";

            // 3. Commands ෆෝල්ඩරය පීරලා Category ටික ඔටෝ ගැනීම
            const cmdsPath = path.join(__dirname);
            const cmdFiles = fs
                .readdirSync(cmdsPath)
                .filter((file) => file.endsWith(".js"));

            let categories = [];
            cmdFiles.forEach((file) => {
                // Cache එක අයින් කරලා අලුත්ම දත්ත ගන්නවා
                delete require.cache[require.resolve(`./${file}`)];
                const cmd = require(`./${file}`);
                if (cmd.category && !categories.includes(cmd.category)) {
                    categories.push(cmd.category);
                }
            });

            // 4. මෙනු මැසේජ් එක සකස් කිරීම
            let menuText = `╭───『 *${botName}* 』───⊷\n`;
            menuText += `│ 👤 *User:* @${senderNumber}\n`;
            menuText += `│ 📅 *Date:* ${date}\n`;
            menuText += `│ 🕒 *Time:* ${time}\n`;
            menuText += `╰───────────────────⊷\n\n`;

            menuText += `*Please reply the menu number you need to see:*\n\n`;

            categories.forEach((cat, index) => {
                menuText += `*${index + 1}* - ${cat.toUpperCase()} MENU\n`;
            });

            menuText += `*${categories.length + 1}* - FULL MENU\n\n`;
            menuText += `> _Powered by ${developerName}_`;

            await conn.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: botLogo },
                    caption: menuText,
                    mentions: [sender],
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("Menu Error Details:", error);
        }
    },
};
