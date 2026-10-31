/**
 * Optimisasi JID & group metadata.
 *
 * xobe-baileys (dan ourin-baileys/Baileys di baliknya) punya hook
 * `cachedGroupMetadata` di config socket, tapi bawaannya no-op
 * (`async () => undefined`). Artinya tiap kirim pesan ke grup, lib
 * query ulang `groupMetadata(jid)` ke WhatsApp buat tau siapa aja
 * participant-nya (dibutuhin buat encrypt pesan). Kalau bot lu sering
 * kirim ke grup yang sama berkali-kali dalam waktu singkat, ini jadi
 * round-trip yang kebuang percuma.
 *
 * `makeCachedGroupMetadata` kasih cache in-memory sederhana (TTL-based)
 * yang bisa langsung dipasang ke opsi socket.
 *
 * Contoh:
 *   import makeWASocket, { makeCachedGroupMetadata } from 'xobe-baileys'
 *
 *   const groupCache = makeCachedGroupMetadata({ ttlMs: 5 * 60 * 1000 })
 *
 *   const sock = makeWASocket({
 *     auth: state,
 *     cachedGroupMetadata: groupCache.get,
 *   })
 *
 *   // kalau ada event yang bikin metadata grup basi (ganti nama,
 *   // member keluar/masuk, dll), hapus entry-nya biar di-fetch ulang:
 *   sock.ev.on('groups.update', (updates) => {
 *     for (const u of updates) if (u.id) groupCache.invalidate(u.id)
 *   })
 *   sock.ev.on('group-participants.update', ({ id }) => groupCache.invalidate(id))
 */
export const makeCachedGroupMetadata = ({ ttlMs = 5 * 60 * 1000 } = {}) => {
    const store = new Map();
    const pending = new Map();
    const get = async (jid) => {
        const hit = store.get(jid);
        const now = Date.now();
        if (hit && now - hit.at < ttlMs) {
            return hit.data;
        }
        // Kalau ada fetch yang masih jalan buat jid yang sama, numpang hasil
        // itu daripada nembak query dobel ke WhatsApp.
        if (pending.has(jid)) {
            return pending.get(jid);
        }
        return undefined;
    };
    /**
     * Dipanggil setelah kamu sendiri fetch `sock.groupMetadata(jid)`,
     * buat nyimpen hasilnya ke cache ini.
     */
    const set = (jid, data) => {
        store.set(jid, { data, at: Date.now() });
    };
    const invalidate = (jid) => {
        store.delete(jid);
        pending.delete(jid);
    };
    const clear = () => {
        store.clear();
        pending.clear();
    };
    /**
     * Bungkus `sock.groupMetadata` biar tiap kali dipanggil otomatis
     * ke-cache. Panggil ini sekali setelah bikin socket:
     *   groupCache.attach(sock)
     */
    const attach = (sock) => {
        const original = sock.groupMetadata.bind(sock);
        sock.groupMetadata = async (jid) => {
            const cached = await get(jid);
            if (cached !== undefined) return cached;
            const fetchPromise = original(jid).then((data) => {
                set(jid, data);
                pending.delete(jid);
                return data;
            }).catch((err) => {
                pending.delete(jid);
                throw err;
            });
            pending.set(jid, fetchPromise);
            return fetchPromise;
        };
        sock.ev.on('groups.update', (updates = []) => {
            for (const u of updates) if (u?.id) invalidate(u.id);
        });
        sock.ev.on('group-participants.update', ({ id } = {}) => {
            if (id) invalidate(id);
        });
        return sock;
    };
    return { get, set, invalidate, clear, attach };
};
