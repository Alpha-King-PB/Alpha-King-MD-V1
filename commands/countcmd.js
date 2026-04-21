const fs = require("fs");

module.exports = {
    name: "countcmd",
    description: "Show total number of commands by category",
    category: "info",
    async execute(conn, m) {
        try {
            const cmdFiles = fs
                .readdirSync("./commands")
                .filter((file) => file.endsWith(".js"));

            let categories = {};
            let totalCmds = 0;

            cmdFiles.forEach((file) => {
                const cmd = require(`./${file}`);
                if (cmd.name) {
                    totalCmds++;
                    const cat = cmd.category || "ᴜɴᴄᴀᴛᴇɢᴏʀɪᴢᴇᴅ";
                    if (!categories[cat]) {
                        categories[cat] = 0;
                    }
                    categories[cat]++;
                }
            });

            let responseText = `📊 *ʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅ sᴛᴀᴛs*\n\n`;

            for (let category in categories) {
                const catName = category.toUpperCase();
                responseText += `*${catName}* : ${categories[category]}\n`;
            }

            responseText += `\n──『 sᴜᴍᴍᴀʀʏ 』──\n`;
            responseText += `💠 *ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs:* ${totalCmds}\n`;
            responseText += `╰────────────────⊷`;

            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: responseText,
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("CountCMD Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄᴏᴜɴᴛ ᴄᴏᴍᴍᴀɴᴅs.",
                },
                { quoted: m },
            );
        }
    },
};
