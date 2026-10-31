// Contoh pakai cache group metadata biar nggak query berulang ke WhatsApp
import makeWASocket, { useMultiFileAuthState, makeCachedGroupMetadata } from "xobe-baileys";
import pino from "pino";

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  // TTL 5 menit: metadata grup dianggap valid 5 menit sebelum di-fetch ulang
  const groupCache = makeCachedGroupMetadata({ ttlMs: 5 * 60 * 1000 });

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    cachedGroupMetadata: groupCache.get,
  });

  sock.ev.on("creds.update", saveCreds);

  // bungkus sock.groupMetadata biar otomatis ke-cache tiap kali dipanggil,
  // dan otomatis invalidate pas ada perubahan grup
  groupCache.attach(sock);
}

start();
