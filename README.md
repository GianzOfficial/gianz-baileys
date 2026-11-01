<div align="center">

# ⚡ gianz-baileys

### Library WhatsApp (Baileys v7) buat bikin bot — fork bersih dari ourin-baileys, tanpa auto-follow channel tersembunyi.

version
license
node
esm
status

Install · Tutorial dari nol · Kenapa fork ini ada · Contoh fitur · Masalah umum

</div>

---

## 🧭 Kenapa fork ini ada

> TL;DR: gianz-baileys adalah fork biasa, bukan paket yang kena deteksi malware.
> ourin-baileys (paket asalnya) ditandai berbahaya oleh npm karena nyimpen kode
> tersembunyi yang bikin bot auto-follow channel WhatsApp tanpa izin. Fork ini
> ngambil kode fungsionalnya aja dan buang bagian auto-follow itu.

Silsilahnya:

Baileys (WhiskeySockets, resmi)  
   │  
   ▼  
ourin-baileys (mod pihak ketiga)  ──►  🚫 ditandai malware di npm (auto-follow tersembunyi)  
   │  
   ▼  
gianz-baileys (fork ini)           ──►  ✅ auto-follow dihapus, nama paket diganti

| Fitur | ourin-baileys 9.0.21 | gianz-baileys |
|---|---|---|
| 🚫 Auto-follow channel pas konek | Ada (aktif default) | Dihapus |
| 🔒 JID channel hardcoded di kode | Ada | Dihapus |
| 🗺️ File source map (.map) | Ada | Dihapus |
| 📦 Status di npm | Ditandai malware | Nggak dipublish ke npm, cuma GitHub |
| ⚙️ Fitur bot (interactive msg, album, VoIP, dll) | Ada | Sama persis |

Detail teknis lengkap (bagian kode mana yang dihapus, dan apa yang belum
diaudit) ada di NOTICE.md, SECURITY.md, dan
CHANGELOG.md. Jangan cuma percaya klaim di README ini —
cek sendiri, kodenya kebuka semua.

---

## 📋 Daftar isi

- 🧭 Kenapa fork ini ada
- ✅ Syarat
- 📦 Install
- 🚀 Bikin bot dari nol
- 🔢 Login pakai pairing code
- ⚡ Optimasi: cache group metadata
- 🧩 Contoh fitur
- 🔁 Pindah dari ourin-baileys
- 🧱 Kalau project lu CommonJS
- 🔍 Cara ngecek nggak ada auto-follow
- 🛠️ Masalah umum
- ⚠️ Catatan penting
- 📄 Lisensi

---

## ✅ Syarat

| Butuh | Kenapa |
|---|---|
| Node.js 20+ | Minimum version yang didukung. Cek: node -v |
| Git | Buat install langsung dari GitHub |
| "type": "module" di package.json | Library ini ESM-only (ada cara buat CommonJS) |

---

## 📦 Install

Dari GitHub (library ini nggak dipublish ke npm, jadi harus lewat GitHub):

```bash
npm install github:GianzOfficial/gianz-baileys

Atau tulis manual di package.json:

{
  "type": "module",
  "dependencies": {
    "gianz-baileys": "github:GianzOfficial/gianz-baileys"
  }
}

lalu:

npm install

<details>
<summary>📎 Paket tambahan (opsional, install sesuai kebutuhan)</summary>npm install pino qrcode-terminal   # logger + QR di terminal
npm install sharp                  # thumbnail gambar (atau jimp)
npm install link-preview-js        # preview link otomatis
npm install audio-decode           # proses audio

Buat thumbnail video, install juga ffmpeg di sistem lu.

</details>---

🚀 Bikin bot dari nol

<details open>
<summary><b>1️⃣ Bikin folder & project</b></summary>mkdir bot-gua
cd bot-gua
npm init -y

</details><details open>
<summary><b>2️⃣ Set ESM di package.json</b></summary>{
  "name": "bot-gua",
  "type": "module"
}

</details><details open>
<summary><b>3️⃣ Install dependency</b></summary>npm install github:GianzOfficial/gianz-baileys pino qrcode-terminal

</details><details open>
<summary><b>4️⃣ Bikin `index.js`</b></summary>import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "gianz-baileys";
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

    if (connection === "open") console.log("✅ Konek!");

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) startBot();
      else console.log("❌ Logout. Hapus folder session lalu login ulang.");
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
      await sock.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓" });
    }
  });
}

startBot();

</details><details open>
<summary><b>5️⃣ Jalanin & scan QR</b></summary>node index.js

Scan QR yang muncul di terminal pakai WhatsApp: Perangkat tertaut → Tautkan perangkat.
Kalau udah muncul ✅ Konek!, kirim .ping ke nomor itu — harusnya dibales Pong! 🏓.

«🔒 Folder session isinya data login bot. Jangan dibagiin ke siapa pun dan jangan
di-upload ke GitHub (udah ke-ignore lewat .gitignore).»

</details>---

🔢 Login pakai pairing code

Nggak mau scan QR? Pakai kode 8 karakter:

const sock = makeWASocket({
  auth: state,
  logger,
  browser: Browsers.windows("Chrome"),
});

sock.ev.on("connection.update", async ({ connection }) => {
  if (connection === "connecting" && !sock.authState.creds.registered) {
    const code = await sock.requestPairingCode("6281234567890"); // nomor bot
    console.log("Pairing code:", code);
  }
});

Di WhatsApp: Perangkat tertaut → Tautkan perangkat → Tautkan dengan nomor telepon,
lalu masukin kodenya.

Contoh lengkap siap pakai: examples/pairing-code.js

---

⚡ Optimasi: cache group metadata

Tiap kirim pesan ke grup, library butuh tau daftar participant grup itu (buat
enkripsi), jadi defaultnya query groupMetadata ke WhatsApp tiap kali kirim.
Kalau bot lu sering kirim ke grup yang sama berkali-kali, ini query yang kebuang
percuma. makeCachedGroupMetadata() nambahin cache in-memory ber-TTL buat ini.

import makeWASocket, { useMultiFileAuthState, makeCachedGroupMetadata } from "gianz-baileys";

const { state, saveCreds } = await useMultiFileAuthState("./session");
const groupCache = makeCachedGroupMetadata({ ttlMs: 5 * 60 * 1000 }); // cache 5 menit

const sock = makeWASocket({
  auth: state,
  cachedGroupMetadata: groupCache.get,
});

sock.ev.on("creds.update", saveCreds);
groupCache.attach(sock); // auto-cache + auto-invalidate pas grup berubah

📄 Contoh lengkap: examples/group-metadata-cache.js

---

🧰 Util tambahan lainnya

Beberapa helper lain yang ditambahin di fork ini, di luar yang udah ada di Baileys/ourin:

<details>
<summary>🚦 <b>Rate limit / anti-spam (<code>makeMessageQueue</code>)</b></summary>Antri pesan biar dikirim dengan jeda, bukan beruntun tanpa henti — ngurangin risiko akun kena flag spam.

import { makeMessageQueue } from "gianz-baileys";

const queue = makeMessageQueue(sock, { delayMs: 1500, maxPerMinute: 20 });
await queue.sendMessage(jid, { text: "halo" }); // dipakai kayak sock.sendMessage biasa

</details><details>
<summary>🏷️ <b>JID vs LID (<code>resolvePNJid</code>, <code>toJid</code>)</b></summary>WhatsApp kadang ngasih identitas user sebagai LID (12345@lid, ID internal)
bukan JID nomor telepon (628xxx@s.whatsapp.net). Kalau LID ini langsung
dipakai buat nge-tag orang, yang ke-mention jadi nomor acak, bukan kontak
aslinya. resolvePNJid numpang mapping store bawaan socket buat nerjemahin
LID → JID nomor telepon sebelum dipakai mention.

import { resolvePNJid, toJid } from "gianz-baileys";

const participants = await sock.groupMetadata(groupJid).then(m => m.participants.map(p => p.id));
const resolved = await Promise.all(participants.map(jid => resolvePNJid(sock, jid)));

await sock.sendMessage(groupJid, {
  text: resolved.map(j => `@${j.split("@")[0]}`).join(" "),
  mentions: resolved,
});

toJid("0812-3456-7890"); // -> "081234567890@s.whatsapp.net"

</details><details>
<summary>📝 <b>Logger siap pakai (<code>createLogger</code>)</b></summary>import { createLogger } from "gianz-baileys";
const logger = createLogger({ level: "warn" }); // default level: "silent"
const sock = makeWASocket({ auth: state, logger });

</details><details>
<summary>🔁 <b>Reconnect dengan backoff (<code>withReconnect</code>)</b></summary>Contoh di tutorial atas (startBot() dipanggil ulang langsung) bisa jadi loop
connect cepet kalau WhatsApp lagi gangguan. withReconnect nambahin jeda yang
makin lama tiap gagal beruntun.

import { withReconnect, DisconnectReason } from "gianz-baileys";

const reconnect = withReconnect(startBot, { baseMs: 2000, maxMs: 60_000 });

sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
  if (connection === "open") reconnect.reset();
  if (connection === "close") {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code !== DisconnectReason.loggedOut) reconnect.schedule();
  }
});

</details>---

🧩 Contoh fitur

«Semua contoh dipanggil dari dalam handler pesan. jid = msg.key.remoteJid.»

<details>
<summary>🔘 <b>Tombol (interactive message)</b></summary>await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Halo!",
    footer: "gianz-baileys",
    header: "Pilih salah satu",
    buttons: [
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Menu", id: ".menu" }) },
      { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Buka website", url: "https://example.com" }) },
      { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Salin kode", copy_code: "KODE123" }) },
    ],
  },
});

Nambah gambar di atasnya: tambahin image: { url: "https://example.com/banner.jpg" }
di dalam interactiveMessage.

</details><details>
<summary>📋 <b>Menu list (single_select)</b></summary>await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Pilih kategori",
    footer: "gianz-baileys",
    header: "Menu Bot",
    buttons: [{
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "Buka menu",
        sections: [{
          title: "Tools",
          rows: [
            { title: "Sticker", id: ".sticker" },
            { title: "TTS", id: ".tts" },
          ],
        }],
      }),
    }],
  },
});

</details><details>
<summary>🖼️ <b>Album (beberapa foto/video sekaligus)</b></summary>await sock.sendMessage(jid, {
  albumMessage: [
    { image: { url: "./foto1.jpg" }, caption: "Foto 1" },
    { image: { url: "./foto2.jpg" }, caption: "Foto 2" },
    { video: { url: "./klip.mp4" }, caption: "Video" },
  ],
});

</details><details>
<summary>📣 <b>Channel (newsletter) — manual, bukan auto</b></summary>Fungsi ini hanya jalan kalau kode bot lu sendiri yang manggil:

const info = await sock.cekIDSaluran("https://whatsapp.com/channel/xxxxx");
console.log(info.name, info.subscribers);

await sock.newsletterFollow("1203630000000000@newsletter");
await sock.newsletterUnfollow("1203630000000000@newsletter");

</details>Daftar lengkap fungsi (grup, komunitas, VoIP, rich response, dll) ada di
docs/README-ourin-original.md — itu dokumentasi
bawaan ourin-baileys, jadi di sana masih ketulis ourin-baileys; ganti ke
gianz-baileys di bagian import.

---

🔁 Pindah dari ourin-baileys

# 1. hapus yang lama
npm uninstall ourin-baileys

# 2. pasang gianz-baileys
npm install github:GianzOfficial/gianz-baileys

# 3. bersihin cache lama
rm -rf node_modules package-lock.json
npm install

Cari semua require("ourin-baileys") / import("ourin-baileys") di kode lu dan
ganti jadi gianz-baileys:

# Windows PowerShell
Get-ChildItem -Recurse -Include *.js,*.mjs,*.cjs -Exclude node_modules | Select-String "ourin-baileys"

# Linux / macOS
grep -rn "ourin-baileys" --include=*.js --include=*.mjs --include=*.cjs .

✅ Tes di nomor cadangan dulu sebelum pakai nomor utama.

---

🧱 Kalau project lu CommonJS

Library ini ESM-only. Kalau project lu "type": "commonjs" dan pakai require,
require("gianz-baileys") bakal error. Dua jalan keluar:

<details>
<summary>🅰️ Import dinamis (tanpa ubah project jadi ESM)</summary>async function start() {
  const baileys = await import("gianz-baileys");
  const makeWASocket = baileys.default;
  const { useMultiFileAuthState, DisconnectReason } = baileys;

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const sock = makeWASocket({ auth: state });
  // ...lanjut kayak biasa
}
start();

</details><details>
<summary>🅱️ Ubah project jadi ESM</summary>Tambahin "type": "module" di package.json, ganti semua require jadi import,
dan ganti __dirname / __filename kalau kepake.

</details>---

🔍 Cara ngecek nggak ada auto-follow

Jangan percaya klaim doang — cek sendiri, kodenya kebuka semua:

# harusnya NGGAK ada hasil sama sekali
grep -rn "autoFollow" lib
grep -rn "120363400911374213" lib

# Windows PowerShell
Select-String -Path lib\*\*.js -Pattern "autoFollow","120363400911374213"

Terus tes langsung: konek pakai nomor cadangan, tunggu 3–5 menit (di ourin-baileys
asli, follow-nya jalan setelah delay 90 detik), lalu liat di WhatsApp apakah ada
channel baru yang ke-follow sendiri.

---

🛠️ Masalah umum

<details>
<summary><code>Cannot use import statement outside a module</code> / <code>ERR_REQUIRE_ESM</code></summary>Project lu belum ESM. Tambahin "type": "module" atau pakai cara di
bagian CommonJS.

</details><details>
<summary>QR nggak muncul</summary>printQRInTerminal udah deprecated. Tangkap sendiri qr dari connection.update
dan tampilin pakai qrcode-terminal (lihat contoh di atas).

</details><details>
<summary>Konek terus-terusan putus / loop</summary>Biasanya session rusak. Stop bot, hapus folder session, login ulang.

</details><details>
<summary>Thumbnail / stiker nggak kebentuk</summary>Install sharp (atau jimp), dan ffmpeg buat video.

</details><details>
<summary>Panggilan suara (VoIP) nggak jalan</summary>Butuh paket tambahan @roamhq/wrtc dan ffmpeg.

</details><details>
<summary><code>npm install</code> dari GitHub gagal</summary>Pastiin Git udah ke-install (git --version) dan repo ini public.

</details>---

⚠️ Catatan penting

- ourin-baileys asli udah ditandai malware di npm (Oktober 2026). Fork ini udah
  dibersihin dari auto-follow channel, tapi sisa kodenya belum diaudit penuh,
  terutama file besar di lib/assets/wasm/ dan lib/WAM/constants.js. Baca
  SECURITY.md sebelum dipakai buat hal penting.
- Kalau lu pernah pakai ourin-baileys asli, anggap mesin itu pernah kena: ganti
  token/API key dan pair ulang WhatsApp-nya.
- Jangan upload session/, creds.json, atau .env ke GitHub.
- Library ini nggak resmi dan nggak ada hubungannya sama WhatsApp/Meta. Akun
  yang dipakai buat bot bisa kena banned dari WhatsApp — jangan dipakai buat spam,
  dan pakai nomor cadangan dulu buat tes.
- Nggak ada garansi. Pakai dengan risiko sendiri.

---

📄 Lisensi

MIT. Hak cipta asli milik pembuat Baileys dan ourin-baileys. File
LICENSE jangan dihapus.

🙏 Credits

- WhiskeySockets/Baileys — library asli yang jadi fondasi semua ini. Semua kerja berat (protokol WhatsApp, enkripsi Signal, dll) dari sini.
- ourin-baileys — mod pihak ketiga yang nambahin fitur (interactive message, album, VoIP). gianz-baileys dibangun di atas basis kode ini, minus auto-follow-nya.
- Siapa pun yang lapor bug atau bantu audit lewat issue — makasih, itu yang bikin fork ini makin bisa dipercaya.

Kalau mau dukung proyek asalnya, pertimbangkan kontribusi ke
WhiskeySockets/Baileys langsung —
di situlah protokol intinya dirawat.

<div align="center">---

Dibuat di atas kerja keras WhiskeySockets/Baileys · fork dari ourin-baileys

</div>
```
