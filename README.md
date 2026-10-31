# xobe-baileys

Fork **Baileys v7** (mod dari `ourin-baileys` 9.0.21) untuk bot WhatsApp, **tanpa auto-follow channel**.

Bot yang pakai library ini tidak akan otomatis follow channel apa pun saat koneksi terbuka.

## Fitur

- Semua fitur Baileys v7 (multi-device)
- Interactive message, album message, dan AI rich response
- Fungsi channel/newsletter (hanya jalan kalau kamu yang manggil)
- Modul VoIP
- ESM-only

## Apa bedanya dengan ourin-baileys?

| | ourin-baileys 9.0.21 | xobe-baileys |
|---|---|---|
| Auto-follow channel saat connect | Ya (default aktif) | **Dihapus** |
| JID channel hardcoded | Ada | **Dihapus** |
| Source map | Ada | Dihapus |
| Fitur lain | Sama | Sama |

Detail lengkap ada di [NOTICE.md](./NOTICE.md). Dokumentasi asli ourin-baileys disimpan di
[docs/README-ourin-original.md](./docs/README-ourin-original.md). Di situ masih ada nama "ourin",
dan nama paketnya diganti jadi `xobe-baileys`.

## Syarat

- Node.js 20 atau lebih baru
- Project kamu harus `"type": "module"`

## Instalasi

Dari GitHub:

```bash
npm install github:gagadeb11116677/xobe-baileys
```

Atau di `package.json`:

```json
{
  "type": "module",
  "dependencies": {
    "xobe-baileys": "github:gagadeb11116677/xobe-baileys"
  }
}
```

Untuk thumbnail dan pemrosesan media, install juga (opsional): `sharp` atau `jimp`, `link-preview-js`, `audio-decode`.

## Contoh pemakaian

```js
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "xobe-baileys";
import pino from "pino";

const { state, saveCreds } = await useMultiFileAuthState("session");

const sock = makeWASocket({
  auth: state,
  logger: pino({ level: "silent" }),
});

sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
  if (connection === "open") console.log("Terhubung");
  if (connection === "close") {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code !== DisconnectReason.loggedOut) console.log("Terputus, coba konek ulang");
  }
});
```

Contoh lain (interactive message, album, VoIP) ada di
[docs/README-ourin-original.md](./docs/README-ourin-original.md). Ganti `ourin-baileys` jadi `xobe-baileys` di import.

## Keamanan

- Paket asli `ourin-baileys` ditandai malware di npm. Fork ini sudah dibersihkan dari auto-follow channel.
- Kode lain belum diaudit penuh, terutama file `assets/wasm/*` dan `WAM/constants.js`. Review dulu sebelum produksi.
- Jangan commit folder session, `creds.json`, atau `.env` ke GitHub. Semuanya sudah ada di `.gitignore`.

## Lisensi

MIT. Hak cipta asli milik pembuat Baileys dan ourin-baileys, lihat [LICENSE](./LICENSE).

## Disclaimer

Proyek ini tidak berafiliasi dengan WhatsApp atau Meta. Pakai dengan risiko sendiri, dan jangan dipakai untuk spam.
