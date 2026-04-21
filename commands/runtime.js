module.exports = {
    name: "runtime",
    aliases: ["uptime"],
    description: "Check how long the bot has been running",
    category: "info",
    async execute(conn, m) {
        try {
            // තත්පර ගණන දින, පැය, මිනිත්තු සහ තත්පර වලට හැරවීමේ ශ්‍රිතය
            const secondsToHms = (d) => {
                d = Number(d);
                const day = Math.floor(d / (3600 * 24));
                const h = Math.floor((d % (3600 * 24)) / 3600);
                const m = Math.floor((d % 3600) / 60);
                const s = Math.floor(d % 60);

                const dDisplay = day > 0 ? `${day}ᴅ ` : "";
                const hDisplay = h > 0 ? `${h}ʜ ` : "";
                const mDisplay = m > 0 ? `${m}ᴍ ` : "";
                const sDisplay = s > 0 ? `${s}s` : "";
                return dDisplay + hDisplay + mDisplay + sDisplay;
            };

            const uptime = secondsToHms(process.uptime());

            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: `⏳ *ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ:* ${uptime}`,
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("Runtime Error:", error);
        }
    },
};
