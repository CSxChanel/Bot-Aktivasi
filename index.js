const {
   default: makeWASocket,
   DisconnectReason,
   useMultiFileAuthState,
   fetchLatestBaileysVersion,
} = require("@adiwajshing/baileys");
const mysql = require("mysql");
const connection = require("./config.js");
const yargs = require("yargs/yargs");
global.yargs = yargs(process.argv).argv;
const config = require("./config");
const host = config.host;
const user = config.user;
const password = config.password;
const database = config.database;
// Gunakan nilai untuk mengkonfigurasi koneksi database
const db = mysql.createConnection({
   // Gunakan nilai yang disimpan di dalam konfigurasi
});

db.connect((err) => {
   if (err) throw err;
   console.log("Connected to database!");
});

async function connectToWhatsApp() {
   const { state, saveCreds } = await useMultiFileAuthState("login");
   const { version, isLatest } = await fetchLatestBaileysVersion();

   const sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
   });

   sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
         var _a, _b;
         var shouldReconnect =
            ((_b =
               (_a = lastDisconnect.error) === null || _a === void 0
                  ? void 0
                  : _a.output) === null || _b === void 0
               ? void 0
               : _b.statusCode) !== DisconnectReason.loggedOut;
         console.log(
            "connection closed due to ",
            lastDisconnect.error,
            ", reconnecting ",
            shouldReconnect
         );
         if (shouldReconnect) {
            connectToWhatsApp();
         }
      } else if (connection === "open") {
         console.log("opened connection");
      }
   });

   sock.ev.on("creds.update", saveCreds);

   sock.ev.on("messages.upsert", async (m) => {
      m.messages.forEach(async (message) => {
         if (
            !message.message ||
            message.key.fromMe ||
            (message.key && message.key.remoteJid == "status@broadcast")
         )
            return;
         if (message.message.ephemeralMessage) {
            message.message = message.message.ephemeralMessage.message;
         }

         try {
            await messageHandler(sock, message);
         } catch (e) {
            if (!global.yargs.dev) {
               console.log("[ERROR] " + e.message);
               sock.sendMessage(
                  message.key.remoteJid,
                  { text: "Terjadi error! coba lagi nanti" },
                  { quoted: message }
               );
            } else {
               console.log(e);
            }
         }
      });
   });
}

connectToWhatsApp();
