/**
 * Reconnect dengan exponential backoff.
 *
 * Contoh naif (`if (code !== loggedOut) startBot()`) bisa jadi loop connect
 * super cepet kalau WhatsApp lagi gangguan — nembak berkali-kali per detik,
 * yang bisa bikin IP/akun ke-flag. `withReconnect` nambahin jeda yang makin
 * lama tiap gagal beruntun, dan reset lagi begitu konek sukses.
 *
 * Contoh:
 *   import makeWASocket, { useMultiFileAuthState, withReconnect } from "xobe-baileys"
 *
 *   const reconnect = withReconnect(startBot, { baseMs: 2000, maxMs: 60_000 })
 *
 *   async function startBot() {
 *     const { state, saveCreds } = await useMultiFileAuthState("./session")
 *     const sock = makeWASocket({ auth: state })
 *     sock.ev.on("creds.update", saveCreds)
 *     sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
 *       if (connection === "open") reconnect.reset()
 *       if (connection === "close") {
 *         const code = lastDisconnect?.error?.output?.statusCode
 *         if (code !== DisconnectReason.loggedOut) reconnect.schedule()
 *         else console.log("Logout, hapus session dan login ulang.")
 *       }
 *     })
 *   }
 *
 *   startBot()
 */
export const withReconnect = (startFn, { baseMs = 2000, maxMs = 60_000, factor = 2 } = {}) => {
    let attempt = 0;
    let timer = null;
    const reset = () => {
        attempt = 0;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };
    const schedule = () => {
        const delay = Math.min(baseMs * Math.pow(factor, attempt), maxMs);
        attempt += 1;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            startFn();
        }, delay);
        return delay;
    };
    return { reset, schedule, get attempt() { return attempt; } };
};
