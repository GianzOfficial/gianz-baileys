# Changelog

Semua perubahan yang lumayan penting dicatat di sini.

## [1.0.0] — 2026-10-31

Rilis stabil pertama. Basis: `ourin-baileys` 9.0.21 (mod dari Baileys v7 / WhiskeySockets).

### Ditambah
- `makeCachedGroupMetadata()` di `Utils/jid-cache.js`: cache in-memory (TTL) buat
  `groupMetadata`, biar kirim pesan ke grup yang sama berkali-kali nggak nembak
  query ke WhatsApp tiap kali. Diekspor dari root (`import { makeCachedGroupMetadata } from "xobe-baileys"`).
  Auto-invalidate pas ada event `groups.update` / `group-participants.update`.
- Folder `examples/`: `basic-bot.js`, `pairing-code.js`, `group-metadata-cache.js`.
- `SECURITY.md`, `CHANGELOG.md` (file ini).

### Diubah
- Nama paket: `ourin-baileys` → `xobe-baileys`.

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
