const fs = require("fs");

module.exports = {
    name: "ping",
    aliases: ["speed"],
    category: "main",
    description: "Check the bot speed with an image",
    async execute(conn, m) {
        // 1. Load data from Database (settings.json)
        const settings = JSON.parse(fs.readFileSync("./settings.json"));
        const botName = settings.botName;
        const botStatus = settings.status || "ᴀʟɪᴠᴇ";
        const botLogo = settings.logoUrl;

        // 2. Calculate Actual Latency
        const timestamp = Date.now();
        const latency = Date.now() - m.messageTimestamp * 1000;

        // 3. Prepare the Caption text
        const captionText =
            `*${botName} ᴘɪɴɢ ꜱᴛᴀᴛᴜꜱ*\n\n` +
            `*ʟᴀᴛᴇɴᴄʏ:* ${latency}ᴍꜱ\n` +
            `*ꜱᴛᴀᴛᴜꜱ:* ${botStatus} ⚡`;

        // 4. Send Image with Caption
        await conn.sendMessage(
            m.key.remoteJid,
            {
                image: { url: botLogo },
                caption: captionText,
            },
            { quoted: m },
        );
    },
};
