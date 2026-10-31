// Contoh login pakai pairing code (nggak perlu scan QR)
import makeWASocket, { useMultiFileAuthState, Browsers } from "xobe-baileys";
import pino from "pino";

const NOMOR_BOT = "6281234567890"; // ganti, tanpa + dan tanpa spasi

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }), browser: Browsers.windows("Chrome") });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "connecting" && !sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(NOMOR_BOT);
      console.log("Pairing code:", code);
    }
    if (connection === "open") console.log("Konek!");
  });
}

start();
