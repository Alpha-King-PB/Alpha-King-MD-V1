module.exports = {
    name: "getdp",
    aliases: ["dp", "getpp", "pp"],
    description: "Get profile picture of a user or group",
    category: "tools",
    async execute(conn, m) {
        try {
            let targetJid;

            // 1. Target එක තෝරා ගැනීම (Reply, Mention හෝ Current Chat)
            if (m.message.extendedTextMessage?.contextInfo?.participant) {
                targetJid =
                    m.message.extendedTextMessage.contextInfo.participant;
            } else if (
                m.message.extendedTextMessage?.contextInfo?.mentionedJid
                    ?.length > 0
            ) {
                targetJid =
                    m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else {
                targetJid = m.key.remoteJid;
            }

            // 2. Profile Picture එකේ URL එක ලබා ගැනීම
            let dpUrl;
            try {
                dpUrl = await conn.profilePictureUrl(targetJid, "image");
            } catch (e) {
                // DP එකක් නැතිනම් හෝ Private කර ඇත්නම් Default රූපයක් හෝ error එකක් පෙන්වයි
                return await conn.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ ᴜɴᴀʙʟᴇ ᴛᴏ ʀᴇᴛʀɪᴇᴠᴇ ᴅᴘ. ɪᴛ ᴍɪɢʜᴛ ʙᴇ ᴘʀɪᴠᴀᴛᴇ ᴏʀ ɴᴏᴛ sᴇᴛ.",
                    },
                    { quoted: m },
                );
            }

            // 3. රූපය යැවීම
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: dpUrl },
                    caption: `📸 *ᴅᴘ ʀᴇᴛʀɪᴇᴠᴇᴅ sᴜᴄᴄᴇssꜰᴜʟʟʏ!*`,
                },
                { quoted: m },
            );
        } catch (error) {
            console.log("GetDP Error:", error);
            await conn.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ꜰᴇᴛᴄʜɪɴɢ ᴅᴘ.",
                },
                { quoted: m },
            );
        }
    },
};
