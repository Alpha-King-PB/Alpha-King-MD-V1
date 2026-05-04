require("dotenv").config();
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const { jidDecode } = require("@whiskeysockets/baileys");

// ==========================================
// 1. Load & Initialize Settings
// ==========================================
function getSettings() {
    let settings = JSON.parse(fs.readFileSync("./settings.json"));

    // Auto-create botStatus if it doesn't exist
    if (settings.botStatus === undefined) {
        settings.botStatus = true;
        fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 2));
        console.log(
            "[SYSTEM]: botStatus initialized as 'true' in settings.json",
        );
    }
    return settings;
}

let settings = getSettings();
const botName = settings.botName || "Alpha Bot";

// ==========================================
// 2. Main Bot Function
// ==========================================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    console.log(`[SYSTEM]: Starting ${botName} using Baileys v${version}...`);

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false,
    });

    conn.codeRequested = false;

    // ==========================================
    // 3. Connection Management
    // ==========================================
    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            console.log(
                `[CONNECTION]: Closed (Status: ${statusCode}). Retrying in 5s...`,
            );

            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => startBot(), 5000);
            }
        } else if (connection === "open") {
            console.log(`[SUCCESS]: ${botName} connected successfully! ✅`);
        }

        // --- Pairing Code Logic ---
        if (!conn.authState.creds.registered && !conn.codeRequested) {
            conn.codeRequested = true;
            const phoneNumber = settings.pairNumber?.replace(/[^0-9]/g, "");

            if (phoneNumber) {
                console.log(`[PAIRING]: Requesting code for: ${phoneNumber}`);
                setTimeout(async () => {
                    try {
                        let code = await conn.requestPairingCode(phoneNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        console.log(
                            "\n-----------------------------------------",
                        );
                        console.log(`YOUR VALID PAIRING CODE: ${code}`);
                        console.log(
                            "-----------------------------------------\n",
                        );
                    } catch (err) {
                        console.error("[PAIRING ERROR]:", err.message);
                        conn.codeRequested = false;
                    }
                }, 15000);
            }
        }

        // --- Helper Function: Decode JID ---
        conn.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return (
                    (decode.user &&
                        decode.server &&
                        decode.user + "@" + decode.server) ||
                    jid
                );
            } else return jid;
        };
    });

    // ==========================================
    // 4. Message Handling Logic
    // ==========================================
    conn.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;

            // Decode Sender ID
            m.sender = conn.decodeJid(
                m.key.fromMe
                    ? conn.user.id
                    : m.key.participant || m.key.remoteJid,
            );

            // Get Message Text / Caption
            const msgContent =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                m.message.videoMessage?.caption ||
                "";

            const isReply =
                m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const prefix = settings.prefix || ".";

            // --- Menu Reply Handling ---
            if (isReply && !isNaN(msgContent.trim())) {
                // (Menu logic can be expanded here if needed)
            }

            // ==========================================
            // 5. Command Handler & Lock Checks
            // ==========================================
            if (msgContent.startsWith(prefix)) {
                const args = msgContent.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();

                // Load fresh settings for real-time lock updates
                const liveSettings = JSON.parse(
                    fs.readFileSync("./settings.json"),
                );

                // Load all available command files
                const cmdFiles = fs
                    .readdirSync("./commands")
                    .filter((file) => file.endsWith(".js"));
                let foundCommand = null;

                // Find command by name or alias
                for (const file of cmdFiles) {
                    const cmd = require(`./commands/${file}`);
                    if (
                        cmd.name === commandName ||
                        (cmd.aliases && cmd.aliases.includes(commandName))
                    ) {
                        foundCommand = cmd;
                        break;
                    }
                }

                if (foundCommand) {
                    // --- THE LOCK ENGINE ---
                    // Commands that work even when botStatus is false
                    const allowedWhileOff = [
                        "alive",
                        "menu",
                        "setstatus",
                        "owner",
                        "status",
                    ];

                    if (
                        liveSettings.botStatus === false &&
                        !allowedWhileOff.includes(foundCommand.name)
                    ) {
                        console.log(
                            `[LOCK-SYSTEM]: Blocked command '${foundCommand.name}' because botStatus is OFF.`,
                        );
                        return; // Stop execution here
                    }

                    // --- EXECUTION ENGINE ---
                    try {
                        console.log(
                            `[EXECUTE]: Running ${foundCommand.name} for ${m.sender}`,
                        );

                        // Hot Reload Logic: Clear cache before requiring
                        const commandPath = `./commands/${cmdFiles.find((f) => {
                            const c = require(`./commands/${f}`);
                            return c.name === foundCommand.name;
                        })}`;
                        delete require.cache[require.resolve(commandPath)];

                        const command = require(commandPath);
                        await command.execute(conn, m, commandName);
                    } catch (cmdErr) {
                        console.error(
                            `[COMMAND ERROR]: in ${foundCommand.name}:`,
                            cmdErr,
                        );
                    }
                }
            }
        } catch (err) {
            console.error("[CRITICAL ERROR]: in messages.upsert:", err);
        }
    });

    conn.ev.on("creds.update", saveCreds);
}

// Start the engine
startBot();
