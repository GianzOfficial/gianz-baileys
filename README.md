# xobe-baileys

![version](https://img.shields.io/badge/version-1.0.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) ![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

Library WhatsApp (Baileys v7) buat bikin bot. Ini fork dari `ourin-baileys` 9.0.21, jadi semua fiturnya sama, bedanya **nggak ada auto-follow channel**. Bot lu nggak bakal follow channel apa pun kecuali lu sendiri yang nyuruh lewat kode.

Asal-usulnya: Baileys (WhiskeySockets) -> ourin-baileys (mod) -> xobe-baileys (fork ini). Detail perubahan ada di [NOTICE.md](./NOTICE.md) dan [CHANGELOG.md](./CHANGELOG.md).

> Versi 1.0.0 di sini artinya rilis stabil pertama untuk fork ini sendiri, bukan klaim sejajar sama rilis resmi Baileys. Baileys resmi masih di jalur 6.7.x per akhir Oktober 2026, dengan 7.x baru sebagai release candidate.

## Daftar isi

- [Apa yang beda dari ourin-baileys](#apa-yang-beda-dari-ourin-baileys)
- [Syarat](#syarat)
- [Install](#install)
- [Bikin bot dari nol](#bikin-bot-dari-nol)
- [Login pakai pairing code](#login-pakai-pairing-code)
- [Contoh fitur](#contoh-fitur)
- [Pindah dari ourin-baileys](#pindah-dari-ourin-baileys)
- [Kalau project lu CommonJS](#kalau-project-lu-commonjs)
- [Cara ngecek nggak ada auto-follow](#cara-ngecek-nggak-ada-auto-follow)
- [Masalah umum](#masalah-umum)
- [Catatan penting](#catatan-penting)
- [Lisensi](#lisensi)

## Apa yang beda dari ourin-baileys

| | ourin-baileys 9.0.21 | xobe-baileys |
|---|---|---|
| Auto-follow channel pas konek | Ada (aktif default) | Dihapus |
| JID channel hardcoded | Ada | Dihapus |
| File source map (.map) | Ada | Dihapus |
| Fitur lain | - | Sama, nggak diubah |

Fungsi channel kayak `newsletterFollow` masih ada, tapi cuma jalan kalau lu yang manggil.

## Syarat

- Node.js 20 atau lebih baru (cek: `node -v`)
- Git (buat install dari GitHub)
- Project lu pakai `"type": "module"` di package.json (kalau nggak, liat bagian [CommonJS](#kalau-project-lu-commonjs))

## Install

Dari GitHub:

```bash
npm install github:gagadeb11116677/xobe-baileys
```

Atau tulis manual di `package.json`:

```json
{
  "type": "module",
  "dependencies": {
    "xobe-baileys": "github:gagadeb11116677/xobe-baileys"
  }
}
```

lalu `npm install`.

Library ini nggak ada di npm, jadi nggak bisa `npm install xobe-baileys` langsung. Harus lewat GitHub.

Paket tambahan (opsional, install kalau butuh):

```bash
npm install pino qrcode-terminal   # logger dan QR di terminal
npm install sharp                  # bikin thumbnail gambar (atau jimp)
npm install link-preview-js        # preview link otomatis
npm install audio-decode           # proses audio
```

Buat thumbnail video, install juga `ffmpeg` di sistem lu.

## Bikin bot dari nol

1. Bikin folder dan project:

```bash
mkdir bot-gua
cd bot-gua
npm init -y
```

2. Buka `package.json`, tambahin `"type": "module"`:

```json
{
  "name": "bot-gua",
  "type": "module"
}
```

3. Install:

```bash
npm install github:gagadeb11116677/xobe-baileys pino qrcode-terminal
```

4. Bikin file `index.js`:

```js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "xobe-baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const logger = pino({ level: "silent" });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
  });

  // simpen session tiap ada perubahan
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === "open") console.log("Konek!");

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      // kalau bukan logout, konek ulang
      if (code !== DisconnectReason.loggedOut) startBot();
      else console.log("Logout. Hapus folder session lalu login ulang.");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, { text: "Pong!" });
    }
  });
}

startBot();
```

5. Jalanin:

```bash
node index.js
```

6. Scan QR yang muncul di terminal pakai WhatsApp (Perangkat tertaut > Tautkan perangkat). Kalau udah muncul `Konek!`, kirim `.ping` ke nomor itu dan harusnya dibales `Pong!`.

Folder `session` isinya data login bot. Jangan dibagiin ke siapa pun dan jangan di-upload ke GitHub (udah ada di `.gitignore`).

## Login pakai pairing code

Kalau nggak mau scan QR, bisa pakai kode 8 karakter:

```js
const sock = makeWASocket({
  auth: state,
  logger,
  browser: Browsers.windows("Chrome"),
});

sock.ev.on("connection.update", async ({ connection }) => {
  if (connection === "connecting" && !sock.authState.creds.registered) {
    const code = await sock.requestPairingCode("6281234567890"); // nomor bot, tanpa + dan tanpa spasi
    console.log("Pairing code:", code);
  }
});
```

Di WhatsApp: Perangkat tertaut > Tautkan perangkat > Tautkan dengan nomor telepon, lalu masukin kodenya.

Kalau mau kode buatan sendiri, harus pas 8 karakter:

```js
const code = await sock.requestPairingCode("6281234567890", "A1B2C3D4");
```

## Contoh fitur

Semua contoh di bawah dipanggil dari dalam handler pesan. `jid` itu `msg.key.remoteJid`.

### Tombol (interactive message)

```js
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Halo!",
    footer: "xobe-baileys",
    header: "Pilih salah satu",
    buttons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({ display_text: "Menu", id: ".menu" }),
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Buka website",
          url: "https://example.com",
        }),
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "Salin kode",
          copy_code: "KODE123",
        }),
      },
    ],
  },
});
```

Nambah gambar di atasnya: tambahin `image: { url: "https://example.com/banner.jpg" }` di dalam `interactiveMessage`.

### Menu list (single_select)

```js
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Pilih kategori",
    footer: "xobe-baileys",
    header: "Menu Bot",
    buttons: [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "Buka menu",
          sections: [
            {
              title: "Tools",
              rows: [
                { title: "Sticker", id: ".sticker" },
                { title: "TTS", id: ".tts" },
              ],
            },
          ],
        }),
      },
    ],
  },
});
```

### Album (beberapa foto/video sekaligus)

```js
await sock.sendMessage(jid, {
  albumMessage: [
    { image: { url: "./foto1.jpg" }, caption: "Foto 1" },
    { image: { url: "./foto2.jpg" }, caption: "Foto 2" },
    { video: { url: "./klip.mp4" }, caption: "Video" },
  ],
});
```

### Channel (newsletter)

Ini baru jalan kalau lu yang manggil. Contoh:

```js
// ambil info channel dari link
const info = await sock.cekIDSaluran("https://whatsapp.com/channel/xxxxx");
console.log(info.name, info.subscribers);

// follow / unfollow
await sock.newsletterFollow("1203630000000000@newsletter");
await sock.newsletterUnfollow("1203630000000000@newsletter");
```

Daftar lengkap fungsi (grup, komunitas, VoIP, rich response, dll) ada di [docs/README-ourin-original.md](./docs/README-ourin-original.md). Itu dokumentasi bawaan ourin-baileys, jadi di sana masih ketulis `ourin-baileys`. Ganti jadi `xobe-baileys` di bagian import.

## Optimasi: cache group metadata

Tiap kirim pesan ke grup, library butuh tau daftar participant grup itu
(buat enkripsi), jadi defaultnya query `groupMetadata` ke WhatsApp tiap kali
kirim. Kalau bot lu sering kirim ke grup yang sama berulang kali dalam waktu
singkat, ini query yang kebuang percuma.

```js
import makeWASocket, { useMultiFileAuthState, makeCachedGroupMetadata } from "xobe-baileys";

const { state, saveCreds } = await useMultiFileAuthState("./session");
const groupCache = makeCachedGroupMetadata({ ttlMs: 5 * 60 * 1000 }); // cache 5 menit

const sock = makeWASocket({
  auth: state,
  cachedGroupMetadata: groupCache.get,
});

sock.ev.on("creds.update", saveCreds);

// bungkus sock.groupMetadata biar otomatis ke-cache + auto-invalidate
// pas ada perubahan grup (ganti nama, member masuk/keluar)
groupCache.attach(sock);
```

Contoh lengkap ada di [examples/group-metadata-cache.js](./examples/group-metadata-cache.js).

## Pindah dari ourin-baileys

1. Hapus yang lama:

```bash
npm uninstall ourin-baileys
```

2. Pasang xobe-baileys:

```bash
npm install github:gagadeb11116677/xobe-baileys
```

3. Cari semua `ourin-baileys` (atau alias `ourin`) di kode lu dan ganti jadi `xobe-baileys`. Windows PowerShell:

```powershell
Get-ChildItem -Recurse -Include *.js,*.mjs,*.cjs -Exclude node_modules | Select-String "ourin-baileys"
```

4. Hapus folder `node_modules` dan `package-lock.json` biar bersih, lalu `npm install` ulang.

5. Tes di nomor cadangan dulu sebelum pakai nomor utama.

## Kalau project lu CommonJS

Library ini ESM-only. Kalau project lu pakai `"type": "commonjs"` (atau nggak ada "type") dan kodenya pakai `require`, `require("xobe-baileys")` bakal error. Ada dua jalan:

**A. Pakai import dinamis** (tanpa ubah project jadi ESM):

```js
async function start() {
  const baileys = await import("xobe-baileys");
  const makeWASocket = baileys.default;
  const { useMultiFileAuthState, DisconnectReason } = baileys;

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const sock = makeWASocket({ auth: state });
  // ...lanjut kayak biasa
}
start();
```

**B. Ubah project jadi ESM**: tambahin `"type": "module"`, ganti semua `require` jadi `import`, dan ganti `__dirname`/`__filename` kalau kepake.

## Cara ngecek nggak ada auto-follow

Lu nggak perlu percaya gitu aja. Cek sendiri:

```bash
# di folder repo ini, harusnya nggak ada hasil sama sekali
grep -rn "autoFollow" lib
grep -rn "120363400911374213" lib
```

Windows PowerShell:

```powershell
Select-String -Path lib\*\*.js -Pattern "autoFollow","120363400911374213"
```

Terus tes langsung: konek pakai nomor cadangan, tunggu 3-5 menit (di ourin-baileys asli follow-nya jalan setelah delay 90 detik), dan liat di WhatsApp apakah ada channel baru yang ke-follow.

## Masalah umum

**`Cannot use import statement outside a module` / `ERR_REQUIRE_ESM`**
Project lu belum ESM. Tambahin `"type": "module"` atau pakai cara di bagian [CommonJS](#kalau-project-lu-commonjs).

**`npm install` dari GitHub gagal / git error**
Pastiin Git udah ke-install (`git --version`) dan repo ini public.

**QR nggak muncul**
Di config sekarang `printQRInTerminal` udah deprecated. Tangkap sendiri `qr` dari `connection.update` dan tampilin pakai `qrcode-terminal` (kayak contoh di atas).

**Konek terus-terusan putus / loop**
Biasanya session rusak. Stop bot, hapus folder `session`, login ulang.

**Thumbnail/stiker nggak kebentuk**
Install `sharp` (atau `jimp`), dan `ffmpeg` buat video.

**Panggilan suara (VoIP) nggak jalan**
Butuh paket tambahan `@roamhq/wrtc` dan `ffmpeg`.

## Catatan penting

- `ourin-baileys` asli udah ditandai malware di npm (Oktober 2026). Fork ini udah dibersihin dari auto-follow channel, **tapi sisa kodenya belum diaudit penuh**, terutama file besar di `lib/assets/wasm/` dan `lib/WAM/constants.js`. Baca sendiri sebelum dipakai buat hal penting.
- Kalau lu pernah pakai `ourin-baileys` asli, anggap mesin itu pernah kena: ganti token/API key dan pair ulang WhatsApp-nya.
- Jangan upload `session/`, `creds.json`, atau `.env` ke GitHub.
- Library ini nggak resmi dan nggak ada hubungannya sama WhatsApp/Meta. Akun yang dipakai buat bot bisa kena banned dari WhatsApp, jadi jangan dipakai buat spam dan pakai nomor cadangan dulu.
- Nggak ada garansi. Pakai dengan risiko sendiri.

## Lisensi

MIT. Hak cipta asli milik pembuat Baileys dan ourin-baileys. File [LICENSE](./LICENSE) jangan dihapus.
