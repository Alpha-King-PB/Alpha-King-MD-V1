const fs = require("fs");

module.exports = {
    name: "alive",
    aliases: ["online"],
    category: "main",
    description: "Check if the bot is online",
    async execute(conn, m) {
        // 1. Load data from Database (settings.json)
        const settings = JSON.parse(fs.readFileSync("./settings.json"));
        const botName = settings.botName;
        const botStatus = settings.status || "Eʀʀ";
        const botLogo = settings.logoUrl;
        const developerName = settings.developerName || "Eʀʀ";

        // 2. Calculate Uptime (How long the bot has been running)
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

        // 3. Prepare the Alive message text
        const aliveText =
            `*ɪꜱ ${botName} ᴀʟɪᴠᴇ* ⚡\n\n` +
            `*ꜱᴛᴀᴛᴜꜱ:* ${botStatus}\n` +
            `*ᴜᴘᴛɪᴍᴇ:* ${uptimeString}\n` +
            `*Pʀᴇғɪx:* [ ${settings.prefix || "Eʀʀ"} ]\n\n` +
            `> Powered by ${developerName}`;

        // 4. Send the Alive message with image
        await conn.sendMessage(
            m.key.remoteJid,
            {
                image: { url: botLogo },
                caption: aliveText,
            },
            { quoted: m },
        );
    },
};
