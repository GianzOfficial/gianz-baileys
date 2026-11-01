import { isLidUser, isPnUser, jidNormalizedUser, S_WHATSAPP_NET } from '../WABinary/jid-utils.js';

/**
 * Normalisasi & resolusi JID <-> LID.
 *
 * Masalah yang ini atasin: WhatsApp sekarang kadang ngasih identitas user
 * sebagai LID (`"12345678@lid"`, nomor identitas internal) bukan JID nomor
 * telepon biasa (`"628xxx@s.whatsapp.net"`). Kalau LID itu langsung dipakai
 * buat nge-tag/mention orang di pesan, yang ke-tag jadi nomor acak/LID,
 * bukan kontak aslinya.
 *
 * Library ini sendiri udah punya mapping store
 * (`sock.signalRepository.lidMapping`) yang diisi otomatis pas nerima pesan,
 * tapi nggak ada helper gampang buat makenya pas mau kirim/mention. Fungsi di
 * sini numpang mapping store itu.
 *
 * Contoh:
 *   import { resolvePNJid, toJid } from "xobe-baileys"
 *
 *   // sebelum nge-build mentionedJid, pastiin semuanya JID nomor telepon:
 *   const resolved = await Promise.all(
 *     participantJids.map((j) => resolvePNJid(sock, j))
 *   )
 *   await sock.sendMessage(groupJid, {
 *     text: resolved.map((j) => `@${j.split('@')[0]}`).join(' '),
 *     mentions: resolved,
 *   })
 */

/**
 * Ubah nomor telepon ("6281234567890" atau "+62 812-3456-7890") jadi JID
 * standar (`"6281234567890@s.whatsapp.net"`). Kalau yang dikasih udah JID/LID
 * (ada "@"-nya), dikembaliin apa adanya (cuma di-normalize).
 */
export const toJid = (numberOrJid) => {
    if (!numberOrJid) return numberOrJid;
    if (numberOrJid.includes('@')) return jidNormalizedUser(numberOrJid);
    const digitsOnly = numberOrJid.replace(/[^0-9]/g, '');
    return `${digitsOnly}${S_WHATSAPP_NET}`;
};

/**
 * Kalau `jid` itu LID, coba resolve ke JID nomor telepon lewat mapping store
 * bawaan socket. Kalau bukan LID, atau mapping-nya belum ada (belum pernah
 * ketemu user itu), dikembaliin apa adanya — jangan di-skip diem-diem, biar
 * pemanggil bisa decide sendiri (fallback ke LID tetep lebih baik daripada
 * gagal total).
 */
export const resolvePNJid = async (sock, jid) => {
    if (!jid || !isLidUser(jid)) return jid;
    try {
        const pn = await sock?.signalRepository?.lidMapping?.getPNForLID(jid);
        return pn ? jidNormalizedUser(pn) : jid;
    }
    catch {
        return jid;
    }
};

/** Versi array dari `resolvePNJid`, dijalanin paralel. */
export const resolvePNJids = async (sock, jids = []) => {
    return Promise.all(jids.map((j) => resolvePNJid(sock, j)));
};

/**
 * Kebalikannya: kalau butuh LID dari JID nomor telepon (jarang dipakai,
 * tapi disediain buat kelengkapan).
 */
export const resolveLidJid = async (sock, jid) => {
    if (!jid || !isPnUser(jid)) return jid;
    try {
        const lid = await sock?.signalRepository?.lidMapping?.getLIDForPN(jid);
        return lid ? jidNormalizedUser(lid) : jid;
    }
    catch {
        return jid;
    }
};
