const fs = require('fs');

module.exports = {
    name: "setprefix",
    aliases: ["sprefix","sp"],
    description: "Change the bot's prefix",
    category: "owner",
    async execute(conn, m, args) {
        try {
            const settingsFile = './settings.json';
            const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));

            const owners = Array.isArray(settings.ownerNumber) ? settings.ownerNumber : [settings.ownerNumber];
            const ownerId = settings.ownerId || "";
            const sender = m.sender;

            const isOwner = owners.some(num => num && sender.includes(num)) || sender === ownerId;

            if (!isOwner) {
                return await conn.sendMessage(m.key.remoteJid, { 
                    text: "🚫 මචං, මේක කරන්න පුළුවන් බොට්ගේ අයිතිකාරයාට විතරයි!" 
                }, { quoted: m });
            }

            // මැසේජ් එකේ prefix එකෙන් පස්සේ තියෙන කොටස ගන්න (args හරියටම නැත්නම්)
            // උදා: .setprefix # -> මෙතනින් '#' විතරක් වෙන් කරගන්නවා
            const text = m.body ? m.body.split(' ').slice(1).join(' ') : args.join(' ');
            const newPrefix = text.trim();

            // වැදගත්ම දේ: අලුත් ප්‍රිෆික්ස් එකක් දීලම නැත්නම් error එකක් දෙන්න
            if (!newPrefix || newPrefix === "") {
                return await conn.sendMessage(m.key.remoteJid, { 
                    text: `⚠️ කරුණාකර අලුත් ප්‍රිෆික්ස් එක ලබාදෙන්න.\n\n*උදාහරණ:* .setprefix #` 
                }, { quoted: m });
            }

            // අකුරු වලට වඩා සංකේත (Symbols) වලට ඉඩ දෙන්න
            settings.prefix = newPrefix;
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

            const successMsg = `*「 PREFIX UPDATED 」*\n\n` +
                             `✅ *Status:* Success\n` +
                             `🎯 *New Prefix:* [ ${newPrefix} ]\n\n` +
                             `🔄 *Note:* බොට් දැන් අලුත් ප්‍රිෆික්ස් එකෙන් වැඩ කරන්න රීස්ටාර්ට් වෙයි.`;

            await conn.sendMessage(m.key.remoteJid, { text: successMsg }, { quoted: m });

        } catch (error) {
            console.error("[SETPREFIX-ERROR]:", error);
        }
    }
};