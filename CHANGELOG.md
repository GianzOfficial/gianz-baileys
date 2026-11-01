# Changelog

Semua perubahan yang lumayan penting dicatat di sini.

## [1.0.0] — 2026-10-31

Rilis stabil pertama. Basis: `gianz-baileys` 9.0.21 (mod dari Baileys v7 / WhiskeySockets).

### Ditambah
- `makeCachedGroupMetadata()` di `Utils/jid-cache.js`: cache in-memory (TTL) buat
  `groupMetadata`, biar kirim pesan ke grup yang sama berkali-kali nggak nembak
  query ke WhatsApp tiap kali. Diekspor dari root (`import { makeCachedGroupMetadata } from "xobe-baileys"`).
  Auto-invalidate pas ada event `groups.update` / `group-participants.update`.
- Folder `examples/`: `basic-bot.js`, `pairing-code.js`, `group-metadata-cache.js`.
- `SECURITY.md`, `CHANGELOG.md` (file ini).

### Diubah
- Nama paket: `ourin-baileys` → `gianz-baileys`.

### Dihapus (dari 9.0.21)
- Fitur auto-follow channel WhatsApp otomatis saat koneksi terbuka
  (`triggerAutoFollow`, JID channel hardcoded, opsi `autoFollowNewsletter*`
  di `Defaults`). Lihat [NOTICE.md](./NOTICE.md).
- File source map (`.map`).

### Belum diaudit penuh
- `lib/assets/wasm/*` dan `lib/WAM/constants.js` (bundle besar, minified).
- Kode lain di luar jalur auto-follow yang sudah dicek.

### Catatan versi
Baileys resmi (WhiskeySockets) per akhir Oktober 2026 masih di jalur stabil 6.7.x,
dengan jalur 7.x sebagai release candidate. `ourin-baileys`/`xobe-baileys` pakai
penomoran sendiri (9.x) dan sudah banyak dimodifikasi dari basis itu, jadi versi
1.0.0 di sini **bukan** klaim sejajar dengan rilis resmi Baileys mana pun — ini
rilis stabil pertama untuk fork ini sendiri. `fetchLatestWaWebVersion()` tetap
narik versi protokol WhatsApp Web terbaru saat runtime, jadi itu nggak kena
pengaruh nomor versi paket ini.

## [1.1.0] — 2026-10-31

### Ditambah
- `makeMessageQueue()` — antri pengiriman pesan dengan jeda + batas per menit, buat ngurangin risiko akun kena flag spam.
- `resolvePNJid()`, `resolvePNJids()`, `resolveLidJid()`, `toJid()` di `Utils/jid-resolve.js` — nerjemahin LID ↔ JID nomor telepon, numpang `signalRepository.lidMapping` bawaan socket. Mengatasi kasus mention/tag yang kebaca sebagai LID bukan JID.
- `createLogger()` — wrapper pino dengan default siap pakai.
- `withReconnect()` — reconnect dengan exponential backoff, biar nggak jadi tight loop pas WhatsApp gangguan.
- `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/check.yml` (CI: `node --check` ke semua file js tiap push/PR).
- Bagian "Credits" di README.

### Diperbaiki
- `lib/Utils/jid-cache.js` (ditambahkan di 1.0.0) sebelumnya tidak punya file `.d.ts` dan tidak terdaftar di `Utils/index.d.ts`, jadi pemakai TypeScript tidak dapat tipe untuk `makeCachedGroupMetadata`. Sudah ditambahkan, sekaligus untuk semua util baru di atas.

### Audit
- `lib/WAM/constants.js` dan `lib/assets/wasm/*` sudah diaudit (lihat `SECURITY.md`): tidak ditemukan kode eksekusi mencurigakan, keduanya berasal dari kode WhatsApp Web resmi (data statis dan hasil build Emscripten).
