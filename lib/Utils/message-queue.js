/**
 * Queue pengirim pesan dengan jeda & batas per menit.
 *
 * Banyak bot WA kena banned karena kirim pesan ke banyak chat/grup secara
 * beruntun tanpa jeda (pola yang dideteksi WhatsApp sebagai spam/bulk
 * messaging). `makeMessageQueue` nge-antri `sock.sendMessage` di belakang
 * layar: tiap kirim dikasih jeda minimum, dan ada batas maksimum kiriman per
 * menit.
 *
 * Contoh:
 *   import makeWASocket, { makeMessageQueue } from "xobe-baileys"
 *
 *   const sock = makeWASocket({ auth: state })
 *   const queue = makeMessageQueue(sock, { delayMs: 1500, maxPerMinute: 20 })
 *
 *   // dipakai persis kayak sock.sendMessage, tapi otomatis dikasih jeda
 *   await queue.sendMessage(jid, { text: "halo" })
 */
export const makeMessageQueue = (sock, { delayMs = 1200, maxPerMinute = 30 } = {}) => {
    const tasks = [];
    const sentTimestamps = [];
    let running = false;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitForSlot = async () => {
        const now = Date.now();
        // buang timestamp yang udah lewat 1 menit
        while (sentTimestamps.length && now - sentTimestamps[0] > 60_000) {
            sentTimestamps.shift();
        }
        if (sentTimestamps.length >= maxPerMinute) {
            const waitMs = 60_000 - (now - sentTimestamps[0]) + 50;
            await sleep(Math.max(waitMs, 0));
            return waitForSlot();
        }
    };
    const runQueue = async () => {
        if (running) return;
        running = true;
        while (tasks.length) {
            const { jid, content, options, resolve, reject } = tasks.shift();
            try {
                await waitForSlot();
                const result = await sock.sendMessage(jid, content, options);
                sentTimestamps.push(Date.now());
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
            if (tasks.length) await sleep(delayMs);
        }
        running = false;
    };
    const sendMessage = (jid, content, options) => {
        return new Promise((resolve, reject) => {
            tasks.push({ jid, content, options, resolve, reject });
            runQueue();
        });
    };
    return {
        sendMessage,
        /** Berapa pesan yang masih ngantri, belum terkirim. */
        get pending() { return tasks.length; },
    };
};
